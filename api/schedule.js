// /api/schedule.js
// Node.js API endpoint for shift scheduling using javascript-lp-solver

const solver = require('javascript-lp-solver');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { employees, daysInMonth, yearNum, monthNum, shiftRequirements, allShifts, shiftLeads, teamLeads } = req.body;
    // --- Model building logic (copy from frontend, minus browser-only code) ---
    const model = {
      optimize: 'fairness',
      opType: 'min',
      constraints: {},
      variables: {},
      ints: {},
    };
    employees.forEach(emp => {
      for (let d = 1; d <= daysInMonth; d++) {
        allShifts.forEach(shift => {
          const key = `${emp.name}_${d}_${shift}`;
          model.variables[key] = { fairness: 1 + Math.random() * 0.1 };
          model.ints[key] = 1;
        });
      }
    });
    // --- Strict week off constraints ---
    employees.forEach(emp => {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yearNum, monthNum - 1, d);
        const weekday = date.getDay();
        if (weekday !== 0 && weekday !== 6) {
          model.constraints[`${emp.name}_noWeekdayOff_${d}`] = { max: 0 };
          allShifts.forEach(shift => {
            model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_noWeekdayOff_${d}`] = 1;
          });
        }
      }
    });
    employees.forEach(emp => {
      let lastOff = 0;
      let workStreak = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yearNum, monthNum - 1, d);
        const weekday = date.getDay();
        if (weekday === 6 || weekday === 0) {
          if (d - lastOff > 6) {
            model.constraints[`${emp.name}_mustOff_${d}`] = { min: 1 };
            allShifts.forEach(shift => {
              model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_mustOff_${d}`] = 0;
            });
          }
          lastOff = d;
          workStreak = 0;
        } else {
          workStreak++;
          if (workStreak > 6) {
            model.constraints[`${emp.name}_noLongWork_${d}`] = { max: 0 };
            allShifts.forEach(shift => {
              model.variables[`${emp.name}_${d}_${shift}`][`${emp.name}_noLongWork_${d}`] = 1;
            });
          }
        }
      }
    });
    employees.forEach(emp => {
      for (let d = 2; d <= daysInMonth; d++) {
        const date1 = new Date(yearNum, monthNum - 1, d - 1);
        const date2 = new Date(yearNum, monthNum - 1, d);
        const wd1 = date1.getDay();
        const wd2 = date2.getDay();
        if (!((wd1 === 6 || wd1 === 0) && (wd2 === 6 || wd2 === 0))) {
          const key1 = allShifts.map(shift => `${emp.name}_${d-1}_${shift}`);
          const key2 = allShifts.map(shift => `${emp.name}_${d}_${shift}`);
          model.constraints[`${emp.name}_noConsecOff_${d}`] = { min: 1 };
          key1.forEach(k => {
            model.variables[k][`${emp.name}_noConsecOff_${d}`] = 1;
          });
          key2.forEach(k => {
            model.variables[k][`${emp.name}_noConsecOff_${d}`] = 1;
          });
        }
      }
    });
    // --- END strict week off constraints ---
    employees.forEach(emp => {
      for (let d = 1; d <= daysInMonth; d++) {
        const keys = allShifts.map(shift => `${emp.name}_${d}_${shift}`);
        model.constraints[`${emp.name}_day${d}_oneShift`] = { max: 1 };
        keys.forEach(k => {
          model.variables[k][`${emp.name}_day${d}_oneShift`] = 1;
        });
      }
    });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(yearNum, monthNum - 1, d);
      const weekday = date.getDay();
      let req;
      if (weekday === 0) req = shiftRequirements['Sunday'];
      else if (weekday === 6) req = shiftRequirements['Saturday'];
      else req = shiftRequirements['Monday-Friday'];
      allShifts.forEach(shift => {
        const keys = employees.map(emp => `${emp.name}_${d}_${shift}`);
        model.constraints[`day${d}_${shift}_req`] = { equal: req[shift] };
        keys.forEach(k => {
          model.variables[k][`day${d}_${shift}_req`] = 1;
        });
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      shiftLeads.forEach(lead => {
        const keys = allShifts.map(shift => `${lead}_${d}_${shift}`);
        model.constraints[`lead_${lead}_day${d}`] = { min: 1 };
        keys.forEach(k => {
          model.variables[k][`lead_${lead}_day${d}`] = 1;
        });
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(yearNum, monthNum - 1, d);
      const weekday = date.getDay();
      teamLeads.forEach(lead => {
        allShifts.forEach(shift => {
          const key = `${lead}_${d}_${shift}`;
          if (shift !== 'S2' || weekday === 0 || weekday === 6) {
            model.constraints[`no_${lead}_${d}_${shift}`] = { max: 0 };
            model.variables[key][`no_${lead}_${d}_${shift}`] = 1;
          }
        });
      });
    }
    const totalShifts = daysInMonth * allShifts.length;
    const avgShifts = Math.floor((totalShifts * 1.0) / employees.length);
    employees.forEach(emp => {
      const keys = [];
      for (let d = 1; d <= daysInMonth; d++) {
        allShifts.forEach(shift => {
          keys.push(`${emp.name}_${d}_${shift}`);
        });
      }
      model.constraints[`${emp.name}_minShifts`] = { min: avgShifts - 1 };
      model.constraints[`${emp.name}_maxShifts`] = { max: avgShifts + 1 };
      keys.forEach(k => {
        model.variables[k][`${emp.name}_minShifts`] = 1;
        model.variables[k][`${emp.name}_maxShifts`] = 1;
      });
    });
    let results;
    try {
      results = solver.Solve(model);
    } catch (e) {
      res.status(500).json({ error: 'AI scheduling failed' });
      return;
    }
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};
