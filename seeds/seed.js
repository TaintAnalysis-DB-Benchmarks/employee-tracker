const sequelize = require("../config/connection");
const Employee = require("../models/Employee");
const Role = require("../models/Role");
const Department = require("../models/Department");

// Basic:
// const employeeData = require("./employeeData.json");

// Deep-dive eval 10:
const employeeData = require("./employee_tracker_eval_10.json");

// Deep-dive eval 100:
// const employeeData = require("./employee_tracker_eval_100.json");

// Deep-dive eval 1000:
// const employeeData = require("./employee_tracker_eval_1000.json");

const roleData = require("./roleData.json");
const departmentData = require("./departmentData.json");

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await Department.bulkCreate(departmentData, {
    individualHooks: true,
    returning: true,
  });

  await Role.bulkCreate(roleData, {
    individualHooks: true,
    returning: true,
  });

  await Employee.bulkCreate(employeeData, {
    individualHooks: true,
    returning: true,
  });

  process.exit(0);
};

seedDatabase();
