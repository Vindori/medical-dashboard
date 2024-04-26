import React from 'react';
import Patients from './Patients';
import Doctors from './Doctors';
// import Appointments from './Appointments';
import { CssBaseline, Container, Grid, Typography } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" style={{ margin: '20px 0' }}>Medical Dashboard</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Patients />
          </Grid>
          <Grid item xs={12} md={4}>
            <Doctors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
