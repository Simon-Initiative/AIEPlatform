import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';


export default function BasicTable(props) {

  const theDataset = props.theDataset;
  const [selectedVariables, sSelectedVariables] = useState([]);
  const [selectedAssigners, sSelectedAssigners] = useState([]);

  const [columns, sColumns] = useState([]);
  const [rows, sRows] = useState([]);

  const getTable = () => {
    fetch('/apis/analysis/basic_reward_summary_table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        theDatasetId: theDataset['_id']['$oid'],
        selectedVariables: selectedVariables, 
        selectedAssigners: selectedAssigners
      })
    })
      .then(res => res.json())
      .then(data => {
        sColumns(data['result']['columns']);
        sRows(data['result']['rows']);
      })
      .catch(err => console.log(err))
  }

  React.useEffect(() => {
    // Get the very basic A/B test info without any contextual variables
    // make a post request to the backend
    if (theDataset == null) {
      return;
    }
    else {
      getTable([]);
    }
  }, [theDataset, selectedVariables, selectedAssigners]);


  const shouldMergeCells = (rowIndex, columnIndex) => {
    // Add your logic here to determine if cells should be merged
    // For example, you can compare adjacent cells or check certain conditions in the data
    return rowIndex > 0 && rows[rowIndex][columnIndex] === rows[rowIndex - 1][columnIndex];
  };

  return (
    <Container style={{ maxHeight: "100%", display: 'flex', flexDirection: 'column' }}>
      <Typography variant="p">Choose a policy</Typography>
      <Select
        isMulti
        options={theDataset ? theDataset['assigners'].map((assigner, index) => ({
          value: index,
          label: assigner
        })) : []}
        onChange={(options) => {
          sSelectedAssigners(options.map(option => option['label']));
        }}
      />
      <Typography variant="p">Choose a variable</Typography>
      <Select
        isMulti
        options={theDataset ? theDataset['variables'].map((variable, index) => ({
          value: index,
          label: variable
        })) : []}
        onChange={(options) => {
          sSelectedVariables(options.map(option => option['label']));
        }}
      />
      <TableContainer component={Paper} style={{ marginTop: "2em", flex: '1', overflowY: 'auto' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {
                  row.map((cell, columnIndex) => (
                    <TableCell key={columnIndex}>{cell}</TableCell>
                  ))
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
