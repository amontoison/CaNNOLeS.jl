var documenterSearchIndex = {"docs":
[{"location":"reference/#Reference","page":"Reference","title":"Reference","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/#Contents","page":"Reference","title":"Contents","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Pages = [\"reference.md\"]","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/#Index","page":"Reference","title":"Index","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Pages = [\"reference.md\"]","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Modules = [CaNNOLeS]","category":"page"},{"location":"reference/#CaNNOLeS.cannoles-Tuple{NLPModels.AbstractNLSModel}","page":"Reference","title":"CaNNOLeS.cannoles","text":"cannoles(nls)\n\nImplementation of a solver for Nonlinear Least Squares with nonlinear constraints.\n\nmin   f(x) = ¹/₂‖F(x)‖²   s.t.  c(x) = 0\n\nInput:\n\nnls :: AbstractNLSModel: Nonlinear least-squares model created using NLPModels.\n\n\n\n\n\n","category":"method"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"With a JSO-compliant solver, such as CaNNOLeS, we can run the solver on a set of problems, explore the results, and compare to other JSO-compliant solvers using specialized benchmark tools.  We are following here the tutorial in SolverBenchmark.jl to run benchmarks on JSO-compliant solvers.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"using NLSProblems, NLPModels","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"To test the implementation of CaNNOLeS, we use the package NLSProblems.jl, which implements NLSProblemsModel an instance of AbstractNLPModel. ","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"using SolverBenchmark","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"Let us select equality-constrained problems from NLSProblems with a maximum of 10000 variables or constraints. After removing problems with fixed variables, examples with a constant objective, and infeasibility residuals, we are left with 82 problems.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"problems = (NLSProblems.eval(problem)() for problem in filter(x -> x != :NLSProblems, names(NLSProblems)) )","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"We compare here CaNNOLeS with trunk (A. R. Conn, N. I. M. Gould, and Ph. L. Toint (2000). Trust-Region Methods, volume 1 of MPS/SIAM Series on Optimization.) implemented in JSOSolvers.jl on a subset of NLSProblems problems.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"using CaNNOLeS, JSOSolvers","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"To make stopping conditions comparable, we set Ipopt's parameters dual_inf_tol=Inf, constr_viol_tol=Inf and compl_inf_tol=Inf to disable additional stopping conditions related to those tolerances, acceptable_iter=0 to disable the search for an acceptable point.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"#Same time limit for all the solvers\nmax_time = 1200. #20 minutes\n\nsolvers = Dict(\n  :tron => nlp -> tron(\n    nlp,\n    atol = 0.0,\n    rtol = 1e-5,\n  ),\n  :trunk => nlp -> trunk(\n    nlp,\n    atol = 0.0,\n    rtol = 1e-5,\n  ),\n  :cannoles => nlp -> cannoles(\n    nlp,\n    ϵtol = 1e-5,\n  ),\n)\n\nstats = bmark_solvers(solvers, problems, skipif = nls -> !NLPModels.unconstrained(nls))","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"The function bmark_solvers return a Dict of DataFrames with detailed information on the execution. This output can be saved in a data file.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"using JLD2\n@save \"trunk_cannoles_$(string(length(problems))).jld2\" stats","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"The result of the benchmark can be explored via tables,","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"pretty_stats(stats[:cannoles])","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"or it can also be used to make performance profiles.","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"using Plots\ngr()\n\nlegend = Dict(\n  :neval_obj => \"number of f evals\",\n  :neval_residual => \"number of F evals\",\n  :neval_cons => \"number of c evals\", \n  :neval_grad => \"number of ∇f evals\", \n  :neval_jac => \"number of ∇c evals\", \n  :neval_jprod => \"number of ∇c*v evals\", \n  :neval_jtprod  => \"number of ∇cᵀ*v evals\", \n  :neval_hess  => \"number of ∇²f evals\", \n  :elapsed_time => \"elapsed time\"\n)\nperf_title(col) = \"Performance profile on NLSProblems w.r.t. $(string(legend[col]))\"\n\nstyles = [:solid,:dash,:dot,:dashdot] #[:auto, :solid, :dash, :dot, :dashdot, :dashdotdot]\n\nfunction print_pp_column(col::Symbol, stats)\n  \n  ϵ = minimum(minimum(filter(x -> x > 0, df[!, col])) for df in values(stats))\n  first_order(df) = df.status .== :first_order\n  unbounded(df) = df.status .== :unbounded\n  solved(df) = first_order(df) .| unbounded(df)\n  cost(df) = (max.(df[!, col], ϵ) + .!solved(df) .* Inf)\n\n  p = performance_profile(\n    stats, \n    cost, \n    title=perf_title(col), \n    legend=:bottomright, \n    linestyles=styles\n  )\nend\n\nprint_pp_column(:elapsed_time, stats) # with respect to time","category":"page"},{"location":"benchmark/","page":"Benchmark","title":"Benchmark","text":"print_pp_column(:neval_residual, stats) # with respect to number of residual function evaluations","category":"page"},{"location":"#CaNNOLeS-Constrained-and-NoNlinear-Optimizer-of-Least-Squares","page":"Home","title":"CaNNOLeS - Constrained and NoNlinear Optimizer of Least Squares","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"(Image: documentation) (Image: documentation) (Image: CI) (Image: Cirrus CI - Base Branch Build Status) (Image: codecov) (Image: GitHub)","category":"page"},{"location":"","page":"Home","title":"Home","text":"CaNNOLeS is a solver for equality-constrained nonlinear least-squares problems, i.e., optimization problems of the form","category":"page"},{"location":"","page":"Home","title":"Home","text":"min ¹/₂‖F(x)‖²      s. to     c(x) = 0.","category":"page"},{"location":"","page":"Home","title":"Home","text":"It uses other JuliaSmoothOptimizers packages for development. In particular, NLPModels.jl is used for defining the problem, and SolverCore for the output. It also uses HSL.jl's MA57 as main solver, but you can pass linsolve=:ldlfactorizations to use LDLFactorizations.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Cite as","category":"page"},{"location":"","page":"Home","title":"Home","text":"Orban, D., & Siqueira, A. S. A Regularization Method for Constrained Nonlinear Least Squares. Computational Optimization and Applications 76, 961–989 (2020). 10.1007/s10589-020-00201-2","category":"page"},{"location":"","page":"Home","title":"Home","text":"Check CITATION.bib for bibtex.","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Follow HSL.jl's MA57 installation if possible. Otherwise LDLFactorizations.jl will be used.\npkg> add CaNNOLeS","category":"page"},{"location":"#Examples","page":"Home","title":"Examples","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using CaNNOLeS, ADNLPModels\n\n# Rosenbrock\nnls = ADNLSModel(x -> [x[1] - 1; 10 * (x[2] - x[1]^2)], [-1.2; 1.0], 2)\nstats = cannoles(nls)","category":"page"},{"location":"","page":"Home","title":"Home","text":"# Constrained\nnls = ADNLSModel(\n  x -> [x[1] - 1; 10 * (x[2] - x[1]^2)],\n  [-1.2; 1.0],\n  2,\n  x -> [x[1] * x[2] - 1],\n  [0.0],\n  [0.0],\n)\nstats = cannoles(nls)","category":"page"},{"location":"#Bug-reports-and-discussions","page":"Home","title":"Bug reports and discussions","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"If you think you found a bug, feel free to open an issue. Focused suggestions and requests can also be opened as issues. Before opening a pull request, start an issue or a discussion on the topic, please.","category":"page"},{"location":"","page":"Home","title":"Home","text":"If you want to ask a question not suited for a bug report, feel free to start a discussion here. This forum is for general discussion about this repository and the JuliaSmoothOptimizers, so questions about any of our packages are welcome.","category":"page"},{"location":"tutorial/#CaNNOLeS.jl-Tutorial","page":"Tutorial","title":"CaNNOLeS.jl Tutorial","text":"","category":"section"},{"location":"tutorial/#Contents","page":"Tutorial","title":"Contents","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Pages = [\"tutorial.md\"]","category":"page"},{"location":"tutorial/#Fine-tune-CaNNOLeS","page":"Tutorial","title":"Fine-tune CaNNOLeS","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"CaNNOLeS.jl exports the function cannoles:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"   cannoles(nlp :: AbstractNLPModel; kwargs...)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Find below a list of the main options of cannoles.","category":"page"},{"location":"tutorial/#Tolerances-on-the-problem","page":"Tutorial","title":"Tolerances on the problem","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"| Parameters           | Type          | Default         | Description                                        |\n| -------------------- | ------------- | --------------- | -------------------------------------------------- |\n| ϵtol                 | AbstractFloat | √eps(eltype(x)) | tolerance.                                         |\n| unbounded_threshold  | AbstractFloat | -1e5            | below this threshold the problem is unbounded.     |\n| max_f                | Integer       | 100000          | evaluation limit, e.g. `sum_counters(nls) > max_f` |\n| max_time             | AbstractFloat | 30.             | maximum number of seconds.                         |\n| max_inner            | Integer       | 10000           | maximum number of iterations.                      |","category":"page"},{"location":"tutorial/#Algorithmic-parameters","page":"Tutorial","title":"Algorithmic parameters","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"| Parameters                  | Type           | Default           | Description                                        |\n| --------------------------- | -------------- | ----------------- | -------------------------------------------------- |\n| x                           | AbstractVector | copy(nls.meta.x0) | initial guess. |\n| λ                           | AbstractVector | eltype(x)[]       | initial guess for the Lagrange mutlipliers. |\n| method                      | Symbol         | :Newton           | method to compute direction, `:Newton`, `:LM`, `:Newton_noFHess`, or `:Newton_vanishing`. |\n| merit                       | Symbol         | :auglag           | merit function: `:norm1`, `:auglag` |\n| linsolve                    | Symbol         | :ma57             | solver use to compute the factorization: `:ma57`, `:ma97`, `:ldlfactorizations` |\n| check_small_residual        | Bool           | true              | |\n| always_accept_extrapolation | Bool           | false             | |\n| δdec                        | Real           | eltype(x)(0.1)    | |","category":"page"},{"location":"tutorial/#Examples","page":"Tutorial","title":"Examples","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"using CaNNOLeS, ADNLPModels\n\n# Rosenbrock\nnls = ADNLSModel(x -> [x[1] - 1; 10 * (x[2] - x[1]^2)], [-1.2; 1.0], 2)\nstats = cannoles(nls, ϵtol = 1e-5, x = ones(2))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"# Constrained\nnls = ADNLSModel(\n  x -> [x[1] - 1; 10 * (x[2] - x[1]^2)],\n  [-1.2; 1.0],\n  2,\n  x -> [x[1] * x[2] - 1],\n  [0.0],\n  [0.0],\n)\nstats = cannoles(nls, max_time = 10., merit = :auglag)","category":"page"}]
}
