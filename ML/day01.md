# Regression Models — Master Summary

---

## 1. Simple Linear Regression

**What:** Fits a straight line through data to predict Y from one input X.

**Formula:**
```
Y = mX + b

m = Σ((xᵢ - x̄)(yᵢ - ȳ)) / Σ((xᵢ - x̄)²)
b = ȳ - m * x̄
```

**Loss minimized:** Sum of Squared Residuals
```
SSR = Σ(yᵢ - (mxᵢ + b))²
```

**Evaluate:** R² → 0 = useless, 1 = perfect fit
```
R² = 1 - (SS_residual / SS_total)
```

**Gotchas:**
- Outliers destroy the line
- Never extrapolate far outside training range
- R² always looks good on training data — validate on test

---

## 2. Multiple Linear Regression

**What:** Same as Simple LR but with many input features. Fits a hyperplane.

**Formula:**
```
Y = b₀ + b₁X₁ + b₂X₂ + ... + bₙXₙ

Matrix form:  Y = Xβ
Solve with:   β = (XᵀX)⁻¹ Xᵀy   ← Normal Equation
```

**Coefficient meaning:**
```
bᵢ = how much Y changes per unit of Xᵢ, holding all else constant
```

**Gotchas:**
- Multicollinearity: correlated features make coefficients unstable
- R² never decreases when adding features — use Adjusted R²
- Normal Equation is O(p³) — breaks at large feature counts → use GD instead
- More features than rows → XᵀX becomes singular (non-invertible)

---

## 3. Polynomial Regression

**What:** Fits curves instead of lines by creating powered features from X.

**Formula:**
```
Y = b₀ + b₁X + b₂X² + b₃X³ + ...

Feature transform: X → [X⁰, X¹, X², X³]
Then feed into standard Multiple LR — same Normal Equation
```

**Degree controls shape:**
```
Degree 1 → straight line
Degree 2 → parabola
Degree 3 → S-curve
Degree N → danger (overfitting)
```

**Gotchas:**
- High degree = overfitting, always — use cross-validation to pick degree
- Polynomials explode outside training range — extrapolation is catastrophic
- Always normalize X before raising to powers (X³ creates huge numbers)
- X, X², X³ are correlated → multicollinearity → why Regularization exists

---

## 4. Gradient Descent

**What:** Iterative optimizer that nudges parameters downhill on the loss surface. Used when Normal Equation is too slow.

**Core update rule:**
```
θ = θ - α * ∂L/∂θ

θ = parameter  |  α = learning rate  |  ∂L/∂θ = gradient
```

**For Linear Regression:**
```
∂L/∂m = (-2/n) * Σ xᵢ(yᵢ - ŷᵢ)
∂L/∂b = (-2/n) * Σ (yᵢ - ŷᵢ)
```

**Three variants:**
```
Batch GD      → full dataset per step   → slow, smooth
Stochastic GD → 1 sample per step       → fast, noisy
Mini-batch GD → 32–128 samples per step → best of both ✓ (industry standard)
```

**Learning rate effect:**
```
α too small → converges slowly
α too large → overshoots, diverges
α just right → smooth convergence
```

**Gotchas:**
- Always normalize features — uneven scales cause zigzag descent
- Convex loss (Linear Reg) → one global minimum, always safe
- Non-convex loss (Neural Nets) → local minima, saddle points → use Adam
- Vanishing gradients in deep nets → layers stop learning
- 1 epoch ≠ 1 step. With batch size 32 on 3200 samples → 100 steps per epoch

---

## 5. Regularization (Ridge, Lasso, ElasticNet)

**What:** Adds a penalty on large coefficients to the loss function to prevent overfitting.

**Modified loss:**
```
New Loss = SSR + λ * penalty
```

**Three types:**
```
Ridge (L2):    Loss = SSR + λ * Σβᵢ²       → shrinks all, none = 0
Lasso (L1):    Loss = SSR + λ * Σ|βᵢ|      → shrinks + zeros out irrelevant
ElasticNet:    Loss = SSR + λ₁Σ|βᵢ| + λ₂Σβᵢ²  → both combined
```

**Ridge closed form:**
```
β = (XᵀX + λI)⁻¹ Xᵀy   ← λI fixes singular matrix problem too
```

**Lasso:** No closed form → needs coordinate descent (iterative)

**Choosing:**
```
All features likely matter?          → Ridge
Want automatic feature selection?    → Lasso
Correlated features + selection?     → ElasticNet
```

**λ effect:**
```
λ = 0    → plain linear regression (no penalty)
λ small  → slight shrinkage
λ large  → heavy shrinkage, underfitting
λ = ∞   → all β = 0
```

**Gotchas:**
- Always normalize before regularizing — penalty hits all β equally
- Never regularize the intercept (b₀)
- Lasso is unstable with correlated features — flips which one it zeroes
- Always tune λ with cross-validation, never guess

---

## Connection Chain

```
One feature          → Simple Linear Regression
Many features        → Multiple Linear Regression
Curved relationship  → Polynomial Regression
Too many features    → Gradient Descent (Normal Eq. too slow)
Model overfits       → Regularization (Ridge / Lasso / ElasticNet)
```

## Quick Formula Reference

| Model | Key Formula |
|---|---|
| Simple LR | `Y = mX + b` |
| Multiple LR | `β = (XᵀX)⁻¹Xᵀy` |
| Polynomial | `Y = b₀ + b₁X + b₂X² + ...` |
| Gradient Descent | `θ = θ - α * ∂L/∂θ` |
| Ridge | `β = (XᵀX + λI)⁻¹Xᵀy` |
| Lasso | `Loss = SSR + λΣ\|βᵢ\|` |
| ElasticNet | `Loss = SSR + λ₁Σ\|βᵢ\| + λ₂Σβᵢ²` |
