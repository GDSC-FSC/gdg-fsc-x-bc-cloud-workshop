#!/usr/bin/env python3
"""
Demo script showcasing the NYC Restaurant Safety Finder CLI
"""

import subprocess
import time
import sys

commands = [
    ("Show help", ["nyc-restaurants", "--help"]),
    ("Show version", ["nyc-restaurants", "--version"]),
    ("Search Manhattan pizza places with grade A", 
     ["nyc-restaurants", "search", "--borough", "manhattan", "--cuisine", "pizza", "--min-grade", "A"]),
    ("Show all restaurants (limited to 5)", 
     ["nyc-restaurants", "search", "--limit", "5"]),
    ("Get details for Joe's Pizza", 
     ["nyc-restaurants", "details", "Joe's Pizza"]),
    ("Test agent connection", 
     ["nyc-restaurants", "test-agent"]),
    ("Show configuration", 
     ["nyc-restaurants", "config", "--show"]),
]

def run_demo():
    print("🍕 NYC Restaurant Safety Finder CLI Demo")
    print("=" * 50)
    
    for description, cmd in commands:
        print(f"\n▶️  {description}")
        print(f"Command: {' '.join(cmd)}")
        print("-" * 30)
        
        try:
            # For commands that need input, pipe appropriate responses
            if "details" in cmd:
                result = subprocess.run(cmd, input="1\n", text=True, 
                                      capture_output=True, timeout=30)
            else:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            print(result.stdout)
            
            if result.stderr:
                print(f"Error: {result.stderr}")
            
        except subprocess.TimeoutExpired:
            print("Command timed out")
        except Exception as e:
            print(f"Error running command: {e}")
            
        print()
        time.sleep(1)  # Small delay between commands
    
    print("✅ Demo completed!")
    print("\nTo get started:")
    print("1. Set your Cloud Run agent URL: export NYC_RESTAURANTS_AGENT_URL='https://your-service.run.app'")
    print("2. Run: nyc-restaurants search --borough manhattan --cuisine pizza")
    print("3. Try: nyc-restaurants search --map for interactive maps")

if __name__ == "__main__":
    run_demo()