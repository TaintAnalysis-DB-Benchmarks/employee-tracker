const inquirer = require("inquirer");
const Employee = require("./models/Employee");
const Role = require("./models/Role");
const Department = require("./models/Department");
const cTable = require("console.table");
const { raw } = require("express");

// Performance Stuff.
const { performance } = require('perf_hooks');

// Sets up the information to be displayed in the table shown in the console
const viewEmployees = async () => {
  console.log('==================== viewEmployees // start ====================');
  const fnStart = performance.now();
  let employees = await Employee.findAll();
  employeeList = employees.map((d) => d.dataValues);

  for (i = 0; i < employeeList.length; i++) {
    // Get the role name to replace the role ID in the table
    let roleName = await Role.findAll({
      where: {
        id: employeeList[i].role_id,
      },
      raw: true,
    });
    // Get the manager name to replace the role ID in the table
    let managerName = await Employee.findAll({
      where: {
        id: employeeList[i].manager_id,
      },
      raw: true,
    });
    // Get the department of the specific role
    let departmentName = await Department.findAll({
      where: {
        id: roleName[0].department_id,
      },
    });
    // Check if the manager name exists, else dont try and add the name
    if (managerName[0]) {
      employeeList[i].manager_id = managerName[0].first_name;
    }
    // Place the variables
    employeeList[i].role_id = roleName[0].title;
    employeeList[i].salary = roleName[0].salary;
    employeeList[i].department = departmentName[0].name;
  }
  const fnEnd = performance.now();
  console.log('====================  viewEmployees // end  ====================');
  console.log(fnEnd - fnStart);
  console.table(employeeList);
};

// The main start function
const start = async () => {
  await viewEmployees();
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Departments and Their Employees",
          "View All Roles",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Remove Employee",
          "Remove Department",
          "Remove Role",
          "Update Employee Role",
          "Update Employee Manager",
        ],
      },
    ])
    .then((answer) => {
      let chosen = answer.mainQuestion;

      // Runs a switch statement based on the prompt given beforehand
      switch (chosen) {
        case "View All Employees":
          allEmployee();
          break;

        case "View All Departments and Their Employees":
          allDepartment();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "Update Employee Manager":
          updateManager();
          break;

        case "View All Roles":
          viewRoles();
          break;
      }
    });
};

// Returns all of the employees in a prompt list
const allEmployee = async () => {
  let employeeList = [];
  // Simply gets the employees and puts them in an array
  const employee = await Employee.findAll({
    raw: true,
  });
  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message: "Here is a list of all employees, click one to go back.",
        choices: employeeList,
      },
    ])
    .then((answer) => {
      start();
    });
};

// Gives a list of all the departments to view employees under that department
const allDepartment = async () => {
  let departmentList = [];
  // Gets the departments for the prompt to display
  const department = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < department.length; i++) {
    departmentList.push(department[i].name);
  }
  departmentList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainQuestion",
        message:
          "Select a department to view all the employees under that department.",
        choices: departmentList,
      },
    ])
    .then(async (answer) => {
      // Checks if they wish to return to main
      if (answer.mainQuestion === "Return To Main Menu") {
        start();
      } else {
        console.log('==================== chooseDepartment // start ====================');
        const fnStart = performance.now();

        departmentChoice = answer.mainQuestion;

        let employeeArray = [];
        // Finds the department chosen
        const departmentChosen = await Department.findAll({
          where: {
            name: departmentChoice,
          },
          raw: true,
        });
        // Finds all the roles under a department
        const rolesChosen = await Role.findAll({
          where: {
            department_id: departmentChosen[0].id,
          },
          raw: true,
        });
        // Iterates through the roles array
        for (i = 0; i < rolesChosen.length; i++) {
          // Gets all the employees under each role
          const employeesChosen = await Employee.findAll({
            where: {
              role_id: rolesChosen[i].id,
            },
            raw: true,
          });
          // Goes through the list of employees and pushes their names to an array
          for (i = 0; i < employeesChosen.length; i++) {
            employeeArray.push(employeesChosen[i].first_name);
          }
        }
        const fnEnd = performance.now();
        console.log('====================  chooseDepartment // end  ====================');
        console.log(fnEnd - fnStart);
        employeeArray.push("Return");
        inquirer
          .prompt([
            {
              type: "list",
              name: "employeeArray",
              message: "Select an employee to return",
              choices: employeeArray,
            },
          ])
          .then((answer) => {
            allDepartment();
          });
      }
    });
};

// Returns all the roles
const viewRoles = async () => {
  let role = [];

  const roleList = await Role.findAll({
    raw: true,
  });

  for (i = 0; i < roleList.length; i++) {
    role.push(roleList[i].title);
  }

  inquirer
    .prompt([
      {
        type: "list",
        message: "Here are all the roles, click one to go back",
        name: "allRoles",
        choices: role,
      },
    ])
    .then((answer) => {
      start();
    });
};

// Add a role to the list of roles
const addRole = async () => {
  let departments = [];

  const departemntList = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < departemntList.length; i++) {
    departments.push(departemntList[i].name);
  }

  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role you want to add?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role you want to add?",
        name: "roleSalary",
      },
      {
        type: "list",
        message: "What is the department of the role you want to add?",
        name: "roleDepartment",
        choices: departments,
      },
    ])
    .then(async (answer) => {
      departmentName = answer.roleDepartment;

      // Get the role department by name so we can get that id
      const departments = await Department.findAll({
        where: {
          name: departmentName,
        },
        raw: true,
      });

      // Create the new role
      await Role.create({
        title: answer.roleName,
        salary: answer.roleSalary,
        department_id: departments[0].id,
      });
      console.log("Role has been created");
      start();
    });
};

// Remove a role from the list
const removeRole = async () => {
  let roleList = [];

  const role = await Role.findAll({
    raw: true,
  });

  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }
  roleList.push("Go Back To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        message: "What is the name of the role you want to delete?",
        name: "roleChoice",
        choices: roleList,
      },
    ])
    .then(async (answer) => {
      // Handle a return option to go back to the main menu
      if (answer.roleChoice === "Go Back To Main Menu") {
        start();
      } else {
        let roleName = answer.roleChoice;
        // Destroys selected role
        await Role.destroy({
          where: {
            title: roleName,
          },
        });
        console.log("Role has been Deleted");
        start();
      }
    });
};

// Add a department to the list of departments
const addDepartment = async () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department you want to add?",
        name: "newDepartment",
      },
    ])
    .then(async (answer) => {
      let departmentName = answer.newDepartment;
      await Department.create({
        name: departmentName,
      });
      console.log("Department has been created");
      start();
    });
};

// Delete a department from the list
const removeDepartment = async () => {
  let departmentList = [];

  const department = await Department.findAll({
    raw: true,
  });

  for (i = 0; i < department.length; i++) {
    departmentList.push(department[i].name);
  }
  departmentList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        message: "What is the name of the department you want to delete?",
        name: "department",
        choices: departmentList,
      },
    ])
    .then(async (answer) => {
      let departmentName = answer.department;
      if (departmentName === "Return To Main Menu") {
        start();
      } else {
        // Check to see if there are any roles under this department
        const chosenDepartment = await Department.findAll({
          where: {
            name: departmentName,
          },
          raw: true,
        });
        // Return any roles that might exist in this department
        const rolesInDepartment = await Role.findAll({
          where: {
            department_id: chosenDepartment[0].id,
          },
          raw: true,
        });
        console.log(rolesInDepartment);
        // Check to see if they align
        if (rolesInDepartment.length === 0) {
          await Department.destroy({
            where: {
              name: departmentName,
            },
          });
          console.log("Department has been Deleted");
          start();
        } else {
          console.log("[YOU MUST DELETE ANY ROLES IN THIS DEPARTMENT FIRST]");
          removeDepartment();
        }
      }
    });
};

// Adds an employee and gives options as to which roles and manager they should have
const addEmployee = async () => {
  let managerList = [];
  let roleList = [];

  // Get the managers
  const manager = await Employee.findAll({
    where: {
      manager_id: null,
    },
    raw: true,
  });
  for (i = 0; i < manager.length; i++) {
    managerList.push(manager[i].first_name);
  }
  managerList.push("They are a manager");

  // Get all the roles
  const role = await Role.findAll({
    raw: true,
  });
  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "employeeLast",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What is the employee's role?",
        choices: roleList,
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is the employee's manager?",
        choices: managerList,
      },
    ])
    .then(async (answer) => {
      firstName = answer.employeeName;
      lastName = answer.employeeLast;
      employeRole = answer.employeeRole;
      managerName = answer.employeeManager;

      // Determine if the employee is a manager or not
      if (managerName === "They are a manager") {
        let roleID = await Role.findAll({
          where: {
            title: role,
          },
          raw: true,
        });
        // Create new manager
        await Employee.create({
          first_name: firstName,
          last_name: lastName,
          role_id: roleID[0].id,
          manager_id: null,
        });
        start();
      } else {
        // If the employee is not a manager get the employee manager
        let managerID = await Employee.findAll({
          where: {
            first_name: managerName,
            manager_id: null,
          },
          raw: true,
        });
        // Get the role ID
        let roleID = await Role.findAll({
          where: {
            title: employeRole,
          },
          raw: true,
        });
        // Create the new employee
        await Employee.create({
          first_name: firstName,
          last_name: lastName,
          role_id: roleID[0].id,
          manager_id: managerID[0].id,
        });
        start();
      }
    });
};

// Code to remove an employee from the list
const removeEmployee = async () => {
  let employeeList = [];

  const employee = await Employee.findAll({
    raw: true,
  });

  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  employeeList.push("Return To Main Menu");
  inquirer
    .prompt([
      {
        type: "list",
        name: "removeQuestion",
        message: "What employee do you want to remove?",
        choices: employeeList,
      },
    ])
    .then(async (answer) => {
      if (answer.removeQuestion === "Return To Main Menu") {
        start();
      } else {
        // Check to see if the employee you are deleting is managing other employees
        // Get the employee selected
        const employeeToDelete = await Employee.findAll({
          where: {
            first_name: answer.removeQuestion,
          },
          raw: true,
        });
        // Check to see if anyone is being managed by them
        const suboordinates = await Employee.findAll({
          where: {
            manager_id: employeeToDelete[0].id,
          },
          raw: true,
        });
        if (suboordinates.length !== 0) {
          console.log("[YOU MUST DELETE EMPLOYEES UNDER THIS MANAGER FIRST]");
          removeEmployee();
        } else {
          await Employee.destroy({
            where: {
              first_name: answer.removeQuestion,
            },
          });
          console.log("Employee has been removed from the list.");
          start();
        }
      }
    });
};

const updateRole = async () => {
  let employeeList = [];
  let roleList = [];

  // Get all the employees
  const employee = await Employee.findAll({
    raw: true,
  });
  // Go through and get all the names and push to array
  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  // Get all the roles
  const role = await Role.findAll({
    raw: true,
  });
  // Go through and get all the titles and push to array
  for (i = 0; i < role.length; i++) {
    roleList.push(role[i].title);
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeChoice",
        message: "What employee's role do you want to update?",
        choices: employeeList,
      },
      {
        type: "list",
        name: "roleUpdate",
        message: "What is the employee's role?",
        choices: roleList,
      },
    ])
    .then(async (answer) => {
      // Get the employee based on the choice
      let selected = await Employee.findAll({
        where: {
          first_name: answer.employeeChoice,
        },
        raw: true,
      });
      // Find the role based on the role chosen
      let theRole = await Role.findAll({
        where: {
          title: answer.roleUpdate,
        },
        raw: true,
      });
      // Update the employee
      Employee.update(
        { role_id: theRole[0].id },
        {
          where: {
            first_name: selected[0].first_name,
          },
        }
      );

      console.log("Employee role has been updated.");
      start();
    });
};

const updateManager = async () => {
  let employeeList = [];

  const employee = await Employee.findAll({
    raw: true,
  });

  for (i = 0; i < employee.length; i++) {
    employeeList.push(employee[i].first_name);
  }
  let managerList = [];

  const manager = await Employee.findAll({
    where: {
      manager_id: null,
    },
    raw: true,
  });

  for (i = 0; i < manager.length; i++) {
    managerList.push(manager[i].first_name);
  }
  managerList.push("Return");
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeChoice",
        message: "What employee's manager do you want to update?",
        choices: employeeList,
      },
      {
        type: "list",
        name: "managerUpdate",
        message: "What is the manager's name?",
        choices: managerList,
      },
    ])
    .then(async (answer) => {
      if (answer.managerUpdate === "Return") {
        start();
      }
      let selected = await Employee.findAll({
        where: {
          first_name: answer.employeeChoice,
        },
        raw: true,
      });
      console.log(selected[0]);

      let theManager = await Employee.findAll({
        where: {
          first_name: answer.managerUpdate,
        },
        raw: true,
      });

      console.log(theManager[0]);

      Employee.update(
        { manager_id: theManager[0].id },
        {
          where: {
            first_name: selected[0].first_name,
          },
        }
      );

      console.log("Employee role has been updated.");
      start();
    });
};

module.exports = { start };
