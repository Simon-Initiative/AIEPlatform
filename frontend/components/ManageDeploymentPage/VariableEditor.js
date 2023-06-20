import { React, useState, useEffect } from 'react';
import { Typography, Paper, TextField, Bo, Button, Box } from '@mui/material';
import Select from 'react-select';
function VariableEditor(props) {
    let selectedVariables = props.selectedVariables;
    let sSelectedVariables = props.sSelectedVariables;
    let [existingVariables, sExistingVariables] = useState([]);
    let [newVariable, sNewVariable] = useState("");
    let [newVariableMin, sNewVariableMin] = useState(0);
    let [newVariableMax, sNewVariableMax] = useState(1);
    let [newVariableType, sNewVariableType] = useState("discrete");
    

    let [newVariableMissingStrategy, sNewVariableMissingStrategy] = useState("Random");

    let variableTypes = [
        { value: 'discrete', label: 'discrete' },
        { value: 'continuous', label: 'continuous' },
        { value: 'ordinary', label: 'ordinary'}
    ];

    let missingDataOptions = [
        { value: 'Random', label: 'Random' },
        { value: 'Average', label: 'Average' },
        { value: 'Closest', label: 'Closest' }, 
        { value: 'Most Frequent', label: 'Most Frequent' }, 
        { value: 'Error', label: 'Error' }
    ];

    let [selectedVariableMissingStrategyOption, sSelectedVariableMissingStrategyOption] = useState(missingDataOptions[0]);

    let [selectedVariableTypeOption, sSelectedVariableTypeOption] = useState(variableTypes[0]);
    const handleSelectChange = (options) => {

        // only keep the name of the variables in options, and make a list.
        const selectedVariables = options.map(obj => obj.name);
        sSelectedVariables(selectedVariables);
        console.log(selectedVariables);
    }

    useEffect(() => {
        fetch(`/apis/variables`)
            .then(res => res.json())
            .then(response => {
                if (response['status_code'] === 200)
                    sExistingVariables(response.data)
            })
            .catch(error => {
                alert("something is wrong with loading existing variables. Please try again later.");
            })
    }, []);

    let handleCreateNewVariable = () => {
        fetch(`/apis/variable`, {
            method: "post",
            body: JSON.stringify({
                newVariableName: newVariable, 
                newVariableMin: newVariableMin,
                newVariableMax: newVariableMax,
                newVariableType: newVariableType
            }),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(response => {
                if (response.status_code == 200) {
                    sNewVariable("");
                    sExistingVariables(
                        [ // with a new array
                            ...existingVariables, // that contains all the old items
                            { name: newVariable } // and one new item at the end
                        ]
                    );
                    newVariable = {name: newVariable, index: existingVariables.length}
                    sSelectedVariables(
                        [
                            ...selectedVariables,
                            newVariable
                        ]
                    );
                }
                else {
                    alert(response.message);
                }
            })
    }
    return (
        <Paper sx={{
            m: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Select
                isMulti
                name="variables"
                instanceId="variable-select"
                options={existingVariables}
                getOptionValue={(option) => option['name']}
                getOptionLabel={(option) => option['name']}

                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedVariables.map(v => ({ name: v, value: v }))}
                onChange={(option) => handleSelectChange(option)}
                styles={{
                    // Fixes the overlapping problem of the component
                    menu: provided => ({ ...provided, zIndex: 9999 })
                }}
            />
            <Typography>If you want to create a new variable, please create it below (and this variable will be automatically linked to this mooclet).</Typography>
            <TextField
                required
                sx={{ mt: 1 }}
                id="new-variable-name-input"
                label="New variable name"
                value={newVariable}
                onChange={(e) => sNewVariable(e.target.value)}
                width="100%"
            />

            <TextField
                sx={{ mt: 1 }}
                id="outlined-number"
                label="Min Value"
                type="number"
                value={newVariableMin}
                onChange={(e) => sNewVariableMin(e.target.value)}
            />

            <TextField
                sx={{ mt: 1, mb: 1 }}
                id="outlined-number"
                label="Max Value"
                type="number"
                value={newVariableMax}
                onChange={(e) => sNewVariableMax(e.target.value)}
            />

            <label htmlFor="variable-type-select">Variable Type:</label>
            <Select
                name="colors"
                instanceId="variable-type-select"
                options={variableTypes}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(option) => {
                    sNewVariableType(option.value);
                    sSelectedVariableTypeOption(option);
                }}
                value={selectedVariableTypeOption}
                styles={{
                    // Fixes the overlapping problem of the component
                    menu: provided => ({ ...provided, zIndex: 9999 })
                }}
            />
            <label htmlFor="variable-missing-option">Missing strategy:</label>
            <Select
                name="colors"
                instanceId="variable-missing-option"
                options={missingDataOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(option) => {
                    sNewVariableMissingStrategy(option.value);
                    sSelectedVariableMissingStrategyOption(option);
                }}
                value={selectedVariableMissingStrategyOption}
                styles={{
                    // Fixes the overlapping problem of the component
                    menu: provided => ({ ...provided, zIndex: 9999 })
                }}
            />
            <Button onClick={handleCreateNewVariable} variant="contained" color="primary" sx={{ m: 1 }}>Add a new variable</Button>
        </Paper>
    )
}


export default VariableEditor;