# Retirement Plan Study Framework

Framework for running retirement plan studies using two distinct approaches:

## 1. JSON-Based Studies

Define studies in JSON files, with all configuration in one place:

```json
{
  "name": "pause_strategy_analysis",
  "description": "Analyzing different pause strategies",
  "base_input_file": "static/resources/files/martin.dynaretire.json",
  "result_directory": "results/pause_strategies/pause_strategy_analysis",
  "scenarios": [
    {
      "comment": "Using PSR pause option",
      "changes": {
        "strategic.rebal_pause_option": "psr"
      },
      "result": {
        "prefix": "psr_pause"
      }
    }
  ]
}
```

Run JSON-based study:
```python
generator = StudyGenerator()
results = generator.run_study_from_json("studies/pause_study.json")
```

## 2. Code-Based Studies

Define studies programmatically, with all configuration in code:

```python
def generate_min_spend_study() -> Dict:
    """Generate minimum spending study with all settings"""
    return {
        "name": "min_spending_analysis",
        "description": "Testing min spend rates",
        "base_input_file": "static/resources/files/martin.dynaretire.json",
        "result_directory": "results/min_spend_study/min_spending_analysis",
        "scenarios": [
            {
                "comment": f"Testing {rate}% rate",
                "changes": {
                    "strategic.apply_min": True,
                    "expenses[0].min_rate": rate
                },
                "result": {
                    "prefix": f"minspend_{rate}"
                }
            }
            for rate in [70, 75, 80, 85]
        ]
    }
```

Run code-based study:
```python
generator = StudyGenerator()
study = generate_min_spend_study()
results = generator.run_study_from_dict(study)
```

## Directory Structure

```
tests/
├── studies/                # Study JSON definitions
│   └── pause_study.json   # Example JSON study
└── test_studies.py       # Integration tests

results/                  # Study results
├── pause_strategies/          
│   └── pause_strategy_analysis/   # JSON study results
│       ├── _study_info.json
│       ├── psr_pause_*.json
│       └── no_pause_*.json
└── min_spend_study/
    └── min_spending_analysis/    # Code study results
        ├── _study_info.json
        └── minspend_*_*.json
```

## Running Tests

```bash
# From project root:
PYTHONPATH=/workspaces/dynaretire python tests/test_studies.py
```

## Notes

- Each approach is fully self-contained
- No mixing of JSON and code configuration
- Results go exactly where specified
- Each study has its own _study_info.json
- Result files include timestamps
