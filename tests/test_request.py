#cd /workspaces/dynaretire && rm -rf results/* && ENABLE_CONSOLE_OUTPUT=true PYTHONPATH=/workspaces/dynaretire python tests/test_request.py
"""Integration tests for retirement plan study functionality"""
from classes.study.request.generator import StudyGenerator, generate_min_spend_study

def test_study_scenarios():
    """Test different ways to create and run studies"""
    generator = StudyGenerator()
    
    print("\n1. Running study from JSON file:")
    print("--------------------------------")
    # Uses fully defined JSON - no modifications
    results = generator.run_study_from_json("tests/studies/pause_study.json")
    print("Pause study results:", results)
    
    print("\n2. Running programmatically generated study:")
    print("-----------------------------------------")
    # Uses fully programmatic definition - no JSON involved
    min_spend_study = generate_min_spend_study()
    min_spend_results = generator.run_study_from_dict(min_spend_study)
    print("Min spend study results:", min_spend_results)

if __name__ == "__main__":
    test_study_scenarios()
