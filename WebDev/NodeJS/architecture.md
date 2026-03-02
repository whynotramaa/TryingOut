# Node.js Architecture — In Depth

---

## 1. The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION CODE                        │
│                     (JavaScript / TypeScript)                       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                          NODE.JS RUNTIME                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Node.js APIs / stdlib                   │   │
│  │   fs  │  http  │  net  │  crypto  │  stream  │  events  │...│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────┐   ┌───────────────────────────────┐     │
│  │      V8 Engine         │   │          libuv                │     │
│  │  (JS execution)        │   │  (async I/O + Event Loop)     │     │
│  └────────────────────────┘   └───────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    C/C++ Bindings & Add-ons                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
         ┌──────────────────────┼────────────────────┐
         ▼                      ▼                    ▼
      File System            Network             OS / Kernel
```

---

## 2. Core Components

### 2.1 V8 Engine

```
┌────────────────────────────────────────────────────────┐
│                      V8 ENGINE                         │
│                                                        │
│  JS Source Code                                        │
│       │                                                │
│       ▼                                                │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │   Parser    │───▶│    AST      │                    │
│  └─────────────┘    └──────┬──────┘                    │
│                            │                           │
│                     ┌──────▼──────┐                    │
│                     │  Ignition   │  ◀── Interpreter   │
│                     │ (Bytecode)  │                    │
│                     └──────┬──────┘                    │
│                            │ hot code detected         │
│                     ┌──────▼──────┐                    │
│                     │ TurboFan    │  ◀── JIT Compiler  │
│                     │(Optimized   │                    │
│                     │ Machine     │                    │
│                     │  Code)      │                    │
│                     └─────────────┘                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  Heap Memory                     │  │
│  │   ┌────────────┐   ┌────────────┐               │  │
│  │   │  New Space │   │  Old Space │               │  │
│  │   │ (short-    │   │ (long-     │               │  │
│  │   │  lived)    │   │  lived)    │               │  │
│  │   └────────────┘   └────────────┘               │  │
│  │        GC: Scavenge           GC: Mark-Sweep     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Ignition** interprets bytecode directly (fast startup)
- **TurboFan** JIT-compiles hot paths to native machine code
- **Garbage Collector** uses generational strategy: young objects in New Space (fast minor GC), surviving objects promoted to Old Space (full GC)

---

### 2.2 libuv

```
┌──────────────────────────────────────────────────────────────┐
│                           libuv                              │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │                    Event Loop                      │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   ┌───────────────────────┐  ┌───────────────────────────┐  │
│   │   Network I/O         │  │      Thread Pool          │  │
│   │  (epoll / kqueue /    │  │  (default: 4 threads)     │  │
│   │   IOCP — OS async)    │  │                           │  │
│   │                       │  │  • File system ops        │  │
│   │  • TCP / UDP sockets  │  │  • DNS lookups            │  │
│   │  • Pipes              │  │  • Crypto (heavy)         │  │
│   │  • TTY                │  │  • User tasks via         │  │
│   │                       │  │    worker_threads         │  │
│   └───────────────────────┘  └───────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

> Network I/O is **truly async** (no threads). File I/O uses the **thread pool** because most OS kernels don't expose async file APIs uniformly.

---

## 3. The Event Loop — Phase by Phase

```
  ┌──────────────────────────────────────────────────────────────┐
  │                      EVENT LOOP TICK                         │
  │                                                              │
  │   ┌──────────────┐                                           │
  │   │   timers     │  setTimeout / setInterval callbacks       │
  │   └──────┬───────┘                                           │
  │          │                                                   │
  │   ┌──────▼───────┐                                           │
  │   │  pending I/O │  I/O error callbacks from prev iteration  │
  │   └──────┬───────┘                                           │
  │          │                                                   │
  │   ┌──────▼───────┐                                           │
  │   │    idle /    │  internal use only                        │
  │   │   prepare    │                                           │
  │   └──────┬───────┘                                           │
  │          │                                                   │
  │   ┌──────▼───────┐    ┌──────────────────────────────────┐   │
  │   │     poll     │◀───│  Wait for I/O events (blocking   │   │
  │   │              │    │  if queue empty and no timers)   │   │
  │   └──────┬───────┘    └──────────────────────────────────┘   │
  │          │                                                   │
  │   ┌──────▼───────┐                                           │
  │   │    check     │  setImmediate callbacks                   │
  │   └──────┬───────┘                                           │
  │          │                                                   │
  │   ┌──────▼───────┐                                           │
  │   │    close     │  close event callbacks (e.g. socket)     │
  │   └──────┬───────┘                                           │
  │          │                                                   │
  │          └─────────────────────────────┐                     │
  │                                        ▼                     │
  │               ┌────────────────────────────────────────┐     │
  │               │  Between each phase (microtask queue): │     │
  │               │   1. process.nextTick()  (FIFO)        │     │
  │               │   2. Promise .then()     (FIFO)        │     │
  │               └────────────────────────────────────────┘     │
  └──────────────────────────────────────────────────────────────┘
```

### Priority Order (highest → lowest)

```
process.nextTick()    ← highest, drains completely before promises
    │
    ▼
Promise microtasks    ← queueMicrotask(), .then(), async/await
    │
    ▼
setImmediate()        ← check phase
    │
    ▼
setTimeout(fn, 0)     ← timers phase (≥1ms delay in practice)
    │
    ▼
I/O callbacks         ← poll phase
```

---

## 4. Single-Threaded vs. Multi-Threaded

```
MYTH: "Node.js is single-threaded"
REALITY: Your JS is single-threaded. I/O is not.

┌─────────────────────────────────────────────────────────────────┐
│  MAIN THREAD (V8 + Event Loop)                                  │
│                                                                 │
│   JS executes here, one task at a time                          │
│   ──────────────────────────────────────────────────────►       │
│   task1  task2  [idle: waiting for I/O]  task3  task4           │
└──────────────────────┬──────────────────────────────────────────┘
                       │  offloads heavy I/O
          ┌────────────▼─────────────────────────────────────┐
          │  libuv THREAD POOL  (UV_THREADPOOL_SIZE, def=4)  │
          │                                                  │
          │  Thread 1: [reading file A ...................]  │
          │  Thread 2: [DNS lookup ............]             │
          │  Thread 3: [crypto pbkdf2 .....................]  │
          │  Thread 4: [idle]                                │
          └────────────┬─────────────────────────────────────┘
                       │  results posted back to event loop
                       ▼
              callback fires on main thread
```

---

## 5. Non-Blocking I/O — How It Works

```
Traditional Blocking Model:
───────────────────────────
  Thread ──[request]──► [WAIT 100ms for DB] ──► [response]
  Thread ──[request]──► [WAIT 100ms for DB] ──► [response]
  Thread ──[request]──► [WAIT 100ms for DB] ──► [response]
  (Need 1 thread per concurrent request)

Node.js Non-Blocking Model:
────────────────────────────
  ┌────────────────────────────────────────────────────────────┐
  │  Single Thread                                             │
  │                                                            │
  │  req1 ──► register callback ──► continue                   │
  │  req2 ──► register callback ──► continue                   │
  │  req3 ──► register callback ──► continue                   │
  │                                                            │
  │           ... OS handles I/O in background ...             │
  │                                                            │
  │  ◄── cb1 fires (DB responded for req1) ──► send response   │
  │  ◄── cb3 fires (DB responded for req3) ──► send response   │
  │  ◄── cb2 fires (DB responded for req2) ──► send response   │
  └────────────────────────────────────────────────────────────┘
  (Handles 10,000+ concurrent connections with 1 thread)
```

---

## 6. Memory Model

```
┌────────────────────────────────────────────────────────────┐
│                     PROCESS MEMORY                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   V8 HEAP                            │  │
│  │                                                      │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │  New Space │  │  Old Space  │  │  Code Space  │  │  │
│  │  │   ~8 MB    │  │  ~unlimited │  │  (compiled   │  │  │
│  │  │  (nursery) │  │             │  │   bytecode)  │  │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │  │
│  │                                                      │  │
│  │  ┌─────────────────────┐  ┌───────────────────────┐  │  │
│  │  │    Large Object     │  │    Map Space          │  │  │
│  │  │    Space (>256KB)   │  │   (hidden classes)    │  │  │
│  │  └─────────────────────┘  └───────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  STACK  (call stack, per function frame)             │  │
│  │  primitives, references, return addresses            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BUFFER / ArrayBuffer (outside V8 heap, via C++)     │  │
│  │  Used for binary data, streams, network I/O          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 7. Module System

```
require('module')
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                  Module Resolution                      │
│                                                         │
│  Is it a core module? (fs, http, path...)               │
│       YES ──► return built-in                           │
│       NO  ──▼                                           │
│                                                         │
│  Starts with './' or '../' ?                            │
│       YES ──► resolve relative path                     │
│              try: .js  .json  .node  /index.js          │
│       NO  ──▼                                           │
│                                                         │
│  Walk up node_modules/                                  │
│    ./node_modules/module                                │
│    ../node_modules/module                               │
│    ../../node_modules/module  ...                       │
│       FOUND ──► load                                    │
│       NOT FOUND ──► MODULE_NOT_FOUND error              │
└─────────────────────────────────────────────────────────┘

CommonJS (CJS) Wrapper:
┌─────────────────────────────────────────────────────────┐
│  (function(exports, require, module, __filename,        │
│            __dirname) {                                 │
│                                                         │
│    // YOUR MODULE CODE HERE                             │
│                                                         │
│  });                                                    │
└─────────────────────────────────────────────────────────┘
  ↑ Node wraps every file in this before executing it
  → This is why 'exports', 'require', '__dirname' exist

Module Cache:
  require('lodash') ──► cache miss ──► load & execute ──► cache
  require('lodash') ──► cache HIT  ──► return cached exports
```

---

## 8. Streams Architecture

```
Types of Streams:
─────────────────
  Readable  ──── source of data    (fs.createReadStream, http.IncomingMessage)
  Writable  ──── sink for data     (fs.createWriteStream, http.ServerResponse)
  Duplex    ──── both R+W          (net.Socket, TLS socket)
  Transform ──── duplex + modify   (zlib.createGzip, crypto.createCipher)


Pipeline Example (file compression):
──────────────────────────────────────

  ┌───────────┐     ┌──────────────┐     ┌─────────────┐
  │  Readable │────▶│  Transform   │────▶│  Writable   │
  │           │     │              │     │             │
  │  file.txt │pipe │  gzip        │pipe │ file.txt.gz │
  │  (source) │     │  (compress)  │     │  (dest)     │
  └───────────┘     └──────────────┘     └─────────────┘


Backpressure:
─────────────
  Producer            Consumer
  ─────────           ────────
     │                   │
     │──── chunk ────────▶│
     │──── chunk ────────▶│
     │──── chunk ────────▶│  ← highWaterMark reached!
     │                    │    writable buffer FULL
     │◄── false ──────────│  ← write() returns false
     │                    │
     │    [paused]        │  ← drain awaited
     │                    │
     │◄── 'drain' ────────│  ← buffer emptied
     │                    │
     │──── chunk ────────▶│  ← resume
```

---

## 9. Cluster Module & Worker Threads

```
Single Process (default):
─────────────────────────
  ┌─────────────────────────────────┐
  │  CPU Core 0   CPU Core 1 ...    │
  │  ┌─────────┐                   │
  │  │ Node.js │  ← uses only 1    │
  │  │ Process │    core           │
  │  └─────────┘                   │
  └─────────────────────────────────┘


Cluster Module (multi-process):
────────────────────────────────
  ┌──────────────────────────────────────────────────────────┐
  │  Master Process                                          │
  │  ┌──────────────┐                                        │
  │  │  cluster     │── spawn workers ──▶ ┌──────────────┐  │
  │  │  .fork()     │                     │  Worker 1    │  │
  │  └──────────────┘        port :3000 ◀─│  (Core 0)    │  │
  │                                       └──────────────┘  │
  │                          port :3000 ◀─┌──────────────┐  │
  │  Shared server socket                 │  Worker 2    │  │
  │  OS load-balances                     │  (Core 1)    │  │
  │  incoming connections                 └──────────────┘  │
  └──────────────────────────────────────────────────────────┘


Worker Threads (multi-thread, shared memory):
──────────────────────────────────────────────
  ┌──────────────────────────────────────────────────────────┐
  │  Main Thread (V8 + Event Loop)                           │
  │       │                                                  │
  │       │ new Worker('./worker.js')                        │
  │       ├──────────────────────────┐                       │
  │       │                         ▼                       │
  │       │                  ┌─────────────┐                │
  │       │ postMessage()───▶│  Worker     │                │
  │       │◀──postMessage()──│  Thread     │                │
  │       │                  │  (own V8)   │                │
  │       │  SharedArrayBuffer└─────────────┘               │
  │       │  (zero-copy shared memory)                       │
  └──────────────────────────────────────────────────────────┘
  Use case: CPU-intensive tasks (image processing, ML, crypto)
```

---

## 10. HTTP Server Request Lifecycle

```
Client                        Node.js HTTP Server
──────                        ────────────────────
   │                                   │
   │──── TCP SYN ──────────────────────▶│
   │◀─── TCP SYN-ACK ──────────────────│  (kernel TCP handshake)
   │──── TCP ACK ──────────────────────▶│
   │                                   │
   │──── HTTP GET /api/data ───────────▶│
   │                                   │  net.Socket (Readable)
   │                                   │       │
   │                                   │  http.IncomingMessage
   │                                   │  parsed from socket stream
   │                                   │       │
   │                                   │  'request' event emitted
   │                                   │       │
   │                                   │  ┌────▼─────────────────┐
   │                                   │  │  Your handler fn     │
   │                                   │  │  req, res            │
   │                                   │  │                      │
   │                                   │  │  await db.query()  ──┼──▶ event loop
   │                                   │  │  (non-blocking)      │      (free to
   │                                   │  └──────────────────────┘       handle
   │                                   │         │ DB responds            others)
   │                                   │  ┌──────▼──────────────────┐
   │                                   │  │  res.write(data)        │
   │                                   │  │  res.end()              │
   │                                   │  └─────────────────────────┘
   │◀─── HTTP 200 OK + body ───────────│
   │                                   │
```

---

## 11. Full Architecture Summary

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                          YOUR APP                                    │
 │  ┌──────────────────────────────────────────────────────────────┐    │
 │  │  JS: async/await  Promises  Callbacks  EventEmitter  Streams │    │
 │  └──────────────────────────────────────────────────────────────┘    │
 ├──────────────────────────────────────────────────────────────────────┤
 │                        NODE.JS LAYER                                 │
 │                                                                      │
 │  ┌─────────────────────────┐  ┌─────────────────────────────────┐    │
 │  │       V8 Engine         │  │             libuv               │    │
 │  │  ┌─────────────────┐    │  │  ┌─────────────────────────┐    │    │
 │  │  │  Ignition / TF  │    │  │  │       Event Loop        │    │    │
 │  │  │  (JIT compile)  │    │  │  │  timers→I/O→check→close │    │    │
 │  │  └─────────────────┘    │  │  └─────────────────────────┘    │    │
 │  │  ┌─────────────────┐    │  │  ┌─────────────────────────┐    │    │
 │  │  │    GC / Heap    │    │  │  │      Thread Pool        │    │    │
 │  │  │  New / Old Space│    │  │  │    4 threads (default)  │    │    │
 │  │  └─────────────────┘    │  │  └─────────────────────────┘    │    │
 │  └─────────────────────────┘  └─────────────────────────────────┘    │
 │                                                                      │
 │  ┌────────────────────────────────────────────────────────────────┐  │
 │  │                  C/C++ Bindings  (N-API / nan)                 │  │
 │  └────────────────────────────────────────────────────────────────┘  │
 ├──────────────────────────────────────────────────────────────────────┤
 │                          OS / KERNEL                                 │
 │                                                                      │
 │   epoll (Linux)   kqueue (macOS)   IOCP (Windows)    Threads         │
 │   ──────────────────────────────────────────────────────────────     │
 │   File System     TCP/UDP Sockets     DNS      Timers     Signals    │
 └──────────────────────────────────────────────────────────────────────┘
```

---

## 12. Quick Reference Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT RUNS WHERE?                                               │
│                                                                 │
│  Main Thread (JS + Event Loop):                                 │
│    ✓ All JavaScript execution                                   │
│    ✓ JSON.parse / JSON.stringify                                │
│    ✓ Callbacks, Promises, async/await                           │
│    ✓ EventEmitter callbacks                                     │
│    ✗ NEVER block with sync CPU work here!                       │
│                                                                 │
│  libuv Thread Pool:                                             │
│    ✓ fs.readFile / writeFile / stat                             │
│    ✓ dns.lookup (not dns.resolve)                               │
│    ✓ crypto.pbkdf2 / crypto.randomBytes (large)                 │
│    ✓ zlib compression                                           │
│                                                                 │
│  OS Kernel Async (no threads used):                             │
│    ✓ TCP / UDP connections                                      │
│    ✓ HTTP requests                                              │
│    ✓ Pipes & TTY                                                │
│                                                                 │
│  Worker Threads (separate V8 instances):                        │
│    ✓ CPU-heavy computation                                      │
│    ✓ Image/video processing                                     │
│    ✓ ML inference                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

*Generated with Claude — Node.js Architecture Reference*
