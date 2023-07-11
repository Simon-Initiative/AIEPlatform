import { React, useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, Box, FormControl, InputLabel, MenuItem, NativeSelect } from '@mui/material';
import Select from 'react-select';

function SimulationEditor(props) {
    // TODO: make this saved to DB.
    // TODO: handle when variable and version changes.
    let versions = props.versions;
    let variables = props.variables;
    let deployment = props.deploymentName;
    let study = props.studyName;
    const [simulationSetting, sSimulationSetting] = useState({
        "baseReward": {}, // {version: 1, version: 2}
        "contextualEffects": [], // "{contextual, operator(=, >, < or between), value, version, effect}", 
        "numDays": 5
    });

    useEffect(() => {
        // load simulationSetting
        fetch(`/apis/experimentDesign/getSimulationSetting?deployment=${deployment}&study=${study}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data['status_code'] == 200) {
                    sSimulationSetting(data['simulationSetting']);
                }
                else {
                    let newSimulationSetting = {
                        "baseReward": {},
                        "contextualEffects": [],
                        "numDays": 5
                    };
                    versions.forEach(version => {
                        newSimulationSetting["baseReward"][version['name']] = 0.5;
                    });
                    sSimulationSetting(newSimulationSetting);
                }
            });
    }, []);

    const addNewSimulatedContextualEffect = () => {
        let newSimulationSetting = { ...simulationSetting };
        newSimulationSetting['contextualEffects'].push({
            "variable": null,
            "operator": "=", // TODO: add more operators.
            "value": null,
            "version": null,
            "effect": 0
        });
        sSimulationSetting(newSimulationSetting);
    }

    const handleEffectDelete = (index) => {
        let newSimulationSetting = { ...simulationSetting };
        newSimulationSetting['contextualEffects'].splice(index, 1);
        sSimulationSetting(newSimulationSetting);
    }

    const handleSaveSimulationSetting = () => {
        // An api call (put) /apis/experimentDesign/updateSimulationSetting with deployment and study.
        fetch('/apis/experimentDesign/updateSimulationSetting', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "deployment": deployment,
                "study": study,
                "simulationSetting": simulationSetting
            })
        }).then(response => {
            if (response.status === 200) {
                alert("Successfully updated the simulation setting!");
            } else {
                alert("Failed to update the simulation setting!");
            }
        }
        );
    }

    const handleRunSimulation = () => {
        // An api call (post) /apis/experimentDesign/runSimulation with deployment and study.
        fetch('/apis/experimentDesign/runSimulation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "deployment": deployment,
                "study": study
            })
        }).then(response => {
            if (response.status === 200) {
                alert("Successfully ran the simulation!");
            } else {
                alert(response.message);
            }
        }
        );
    }

    const handleStopSimulation = () => {
        // A PUT call
        fetch('/apis/experimentDesign/stopSimulation', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "deployment": deployment,
                "study": study
            })
        }).then(response => {
            if (response.status === 200) {
                alert("Successfully stopped the simulation!");
            } else {
                alert("Failed to stop the simulation!");
            }
        }
        );
    }

    const contextualEffectEditor = (contextualEffect, index) => {
        //write something like this: When a user is assigned to a version (which is an html select to choose a version), if the contextual (which is an html select to choose a variable) equals to (an input box for numbers), the reward probability is affected by (an input box for numbers).
        return (
            <Box sx={{ mt: 2 }} key={index}>
                <Box variant="body1">When a user is assigned to
                    <FormControl>
                        <NativeSelect
                            sx={{ml: 1, mr: 1}}
                            value={contextualEffect['version'] || ""}
                            onChange={(event) => {
                                let newSimulationSetting = { ...simulationSetting };
                                newSimulationSetting['contextualEffects'][index]['version'] = event.target.value;
                                sSimulationSetting(newSimulationSetting);

                            }}
                        >
                            <option value="">-- Select a version --</option>
                            {versions.map(version => {
                                return (
                                    <option value={version['name']} key={version['name']}>{version['name']}</option>
                                )
                            }
                            )}
                        </NativeSelect>
                    </FormControl>
                    , if <FormControl><NativeSelect
                        sx={{ml: 1, mr: 1}}
                        value={contextualEffect['variable'] || ""}
                        onChange={(event) => {
                            let newSimulationSetting = { ...simulationSetting };
                            newSimulationSetting['contextualEffects'][index]['variable'] = event.target.value;
                            sSimulationSetting(newSimulationSetting);
                        }}
                    >
                        <option value="">-- Select a variable --</option>
                        {variables.map(variable => {
                            return (
                                <option value={variable} key={variable}>{variable}</option>
                            )
                        }
                        )}
                    </NativeSelect>
                    </FormControl> equals to <input type="number" value={contextualEffect['value'] || ""} onChange={(event) => {
                        let newSimulationSetting = { ...simulationSetting };
                        newSimulationSetting['contextualEffects'][index]['value'] = event.target.value;
                        sSimulationSetting(newSimulationSetting);
                    }}></input>, the reward probability is affected by <input type="number" value={contextualEffect['effect' || 0]} onChange={(event) => {
                        let newSimulationSetting = { ...simulationSetting };
                        newSimulationSetting['contextualEffects'][index]['effect'] = event.target.value;
                        sSimulationSetting(newSimulationSetting);
                    }}></input>. <button onClick={() => handleEffectDelete(index)}>Click here if I want to remove this effect {index}</button></Box>
            </Box>
        )
    }

    return (
        <Paper sx={{
            m: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* let's do the base reward probability first. */}
            <Box sx={{ mt: 2 }}>
                <mark>The simulator is now limited to binary reward, and uniform reward distribution!</mark>
                <Typography variant="body1">How many days theis simulation have? (the simulated data will be splited evenly) <input type="number" value={simulationSetting['numDays'] || 5} onChange={(event) => {
                    let newSimulationSetting = { ...simulationSetting };
                    newSimulationSetting['numDays'] = event.target.value;
                    sSimulationSetting(newSimulationSetting);
                }}></input></Typography>
                <Typography variant="h6">Base Reward Probability</Typography>
                {versions.map(version => {
                    return (
                        // for each version, write something like this: Regardless of the contextual, the probability a user assigned to {version['name']} is ____ (this is an input box).
                        <Box sx={{ mt: 2 }} key={version['name']}>
                            <Typography variant="body1">Regardless of the contextual, the probability a user assigned to {version['name']} gives a positive reward is <input type="number" value={simulationSetting['baseReward'][version['name']] || 0.5} onChange={(event) => {
                                let newSimulationSetting = { ...simulationSetting };
                                newSimulationSetting['baseReward'][version['name']] = event.target.value;
                                sSimulationSetting(newSimulationSetting);
                            }}></input></Typography>
                        </Box>
                    )
                })}
                <Typography variant="h6">Contextual Effects</Typography>
                {simulationSetting['contextualEffects'].map((contextualEffect, index) => {
                    return contextualEffectEditor(contextualEffect, index);
                })}
                <Button variant="contained" sx={{ mt: 2 }} onClick={addNewSimulatedContextualEffect}>Add a new simulated contextual effect</Button>

            </Box>
            <Button onClick={handleRunSimulation}>Run Simulations</Button>
            <Button onClick={handleSaveSimulationSetting}>Save</Button>
            <Button onClick={handleStopSimulation}>Stop Simulation</Button>
        </Paper>
    )
}


export default SimulationEditor;