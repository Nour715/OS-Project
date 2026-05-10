# OS-Project

## Overview

This project is a web-based CPU Scheduling Simulator developed to analyze and compare the behavior of two important operating system scheduling algorithms:

- Round Robin (RR)
- Shortest Remaining Time First (SRTF)

The simulator provides a visual and analytical environment that allows users to enter custom process data, execute scheduling algorithms, and evaluate their performance using standard scheduling metrics and execution visualizations.

The system was designed with a modular architecture to improve code organization, maintainability, scalability, and separation of responsibilities.


# Objectives

The main objectives of this project are:

- Simulate CPU scheduling algorithms in a realistic environment
- Compare preemptive scheduling strategies
- Visualize process execution using Gantt Charts
- Demonstrate Ready Queue behavior in Round Robin scheduling
- Measure algorithm performance using standard metrics
- Analyze fairness, responsiveness, and efficiency


# Implemented Algorithms

## 1. Round Robin (RR)

Round Robin is a preemptive scheduling algorithm that allocates CPU time equally among processes using a fixed time quantum.

### Characteristics
- Fair CPU sharing
- Prevents starvation
- Improves response time for interactive systems
- Uses Ready Queue rotation

### Implemented Features
- Configurable time quantum
- Ready Queue tracking
- Context switching simulation
- Response time calculation


## 2. Shortest Remaining Time First (SRTF)

SRTF is a preemptive scheduling algorithm that always selects the process with the shortest remaining burst time.

### Characteristics
- Optimizes average waiting time
- Prioritizes shorter processes
- Frequently preempts running processes

### Implemented Features
- Dynamic process selection
- Remaining-time comparison
- Continuous preemptive scheduling


# Performance Metrics

The simulator automatically calculates:

 Metric -> Description 
 CT -> Completion Time 
 TAT -> Turnaround Time 
 WT -> Waiting Time 
 RT -> Response Time 

Average values for each metric are also calculated for algorithm comparison.


# System Features

- Dynamic process table generation
- Input validation and error handling
- Interactive scheduling simulation
- Gantt Chart visualization
- Ready Queue visualization
- Comparative performance analysis
- Multiple predefined test scenarios
- Responsive and modular UI design


# Project Architecture

The application follows a modular functional architecture consisting of the following sections:

| Module | Responsibility |
|---|---|
| State Management | Stores application state and execution data |
| Cache & UI Sections | Handles DOM references and UI transitions |
| Validation & Data Collection | Validates and collects user input |
| Scheduling Logic (RR) | Executes Round Robin scheduling |
| Scheduling Logic (SRTF) | Executes SRTF scheduling |
| Results Processing & Calculations | Processes results and calculates metrics |
| Rendering & Display | Displays tables, charts, and queue views |
| Comparison & Output Summary | Compares algorithms and generates conclusions |
| Scenarios Management | Loads predefined testing cases |
| Event Handlers & Initialization | Controls application events and startup |

# Core Scheduling Logic

The main scheduling logic is implemented inside:
javascript
runRoundRobin()
runSRTF()

These functions are responsible for:

-Process management
-CPU allocation
-Queue operations
-Time progression
-Context switching
-Preemption handling
-Execution tracking
-Metrics generation
The scheduling cycle is executed through iterative processing loops until all processes complete execution.

# Round Robin Execution Flow

The Round Robin implementation performs the following operations:

1.Insert arrived processes into the Ready Queue
2.Select the first process in FIFO order
3.Execute process for one quantum
4.Update remaining burst time
5.Reinsert unfinished processes into the queue
6.Calculate completion metrics
7.Generate Gantt Chart and Ready Queue history


# SRTF Execution Flow

The SRTF implementation performs the following operations:

1.Detect all ready processes
2.Select process with shortest remaining burst time
3.Execute for one time unit
4.Reevaluate processes continuously
5.Perform preemption if necessary
6.Update execution metrics
7.Generate execution timeline
8.Visualization Components


# Gantt Chart
Displays CPU execution order and execution duration for each process.

# Ready Queue View
Displays the state of the Round Robin Ready Queue at different execution times.

# Comparison Table
Compares both algorithms using average scheduling metrics.

# Technologies Used
-HTML5
-CSS3
-JavaScript (ES6)
No external libraries or frameworks were used in order to focus on implementing scheduling logic manually.

# Educational Significance
This project demonstrates practical implementation of operating system scheduling concepts including:

-Preemptive scheduling
-Queue management
-CPU burst handling
-Process state transitions
-Context switching
-Scheduling fairness
-Performance optimization

 The simulator can be used as an educational tool for Operating Systems courses to help students understand scheduling behavior visually and analytically.

# Conclusion
The simulator successfully demonstrates the operational differences between Round Robin and SRTF scheduling algorithms.

Round Robin provides better fairness and responsiveness through time-sharing, while SRTF generally achieves lower waiting and turnaround times by prioritizing shorter processes.

The project highlights the trade-offs between fairness, responsiveness, and efficiency in CPU scheduling systems.
