import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    setPatients([{"age":12, name:"Lol Kekov", "_id": 1}, {"age":1, name:"Roflan Blinov", "_id": 1}]);
  }, []);

  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
      <Typography variant="h5" style={{ marginBottom: '12px' }}>Patients</Typography>
      <List>
        {patients.map(patient => (
          <ListItem key={patient._id}>
            <ListItemText primary={patient.name} secondary={`${patient.age} years old`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Patients;
