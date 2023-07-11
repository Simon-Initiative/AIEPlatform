import { React, useState, useRef, useEffect } from 'react';
import { Typography, TextField, Box, Button, Container, Input, Tooltip } from '@mui/material';
import VariableEditor from '../ManageDeploymentPage/VariableEditor';
import FactorsEditor from './FactorsEditor';
import VersionEditor from './VersionEditor';
import SimulationEditor from './SimulationEditor';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import MOOCletEditor from './MOOCletEditor/MOOCletEditor';
import RewardEditor from './RewardEditor';
import assignerHandleVersionOrVariableDeletion from '../../helpers/assignerHandleVersionOrVariableDeletion';
import APICard from './APICard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import {
    Tree,
    getBackendOptions,
    MultiBackend,
} from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";

function StudyEditor(props) {

    let theStudy = props.theStudy;
    let sTheStudies = props.sTheStudies;
    let sTheStudy = props.sTheStudy;

    let designGraph = [
        {
            "id": 1,
            "parent": 0,
            "droppable": true,
            "isOpen": true,
            "text": "assigner1",
            "name": "assigner1",
            "policy": "UniformRandom",
            "parameters": {},
            "weight": 100
        }
    ];


    const newStudy = {
        "name": "Create New Study",
        "_id": { "$oid": "1998" }
    };


    const [status, sStatus] = useState(0); // 0: loading, 1: new study, 2: existing study., 4: loading exiting study
    const deploymentName = props.deploymentName;
    const [studyName, sStudyName] = useState("");
    const [variables, sVariables] = useState([]);
    const [versions, sVersions] = useState([]);
    const [factors, sFactors] = useState([]);
    const [mooclets, sMooclets] = useState(designGraph);
    const handleDrop = (newTreeData) => sMooclets(newTreeData);
    const [moocletModalOpen, sMoocletModalOpen] = useState(false);
    const [idToEdit, sIdToEdit] = useState(null);
    const treeRef = useRef(null);
    const handleOpen = (nodeId) => treeRef.current.open(nodeId);

    const [rewardInformation, sRewardInformation] = useState({
        "name": "reward",
        "min": 0,
        "max": 1
    });

    const addMOOClet = () => {
        let newId = mooclets.length + 1;
        let newMOOClet = {
            "id": newId,
            "parent": 1,
            "droppable": true,
            "isOpen": true,
            "text": `assigner${newId}`,
            "name": `assigner${newId}`,
            "policy": "UniformRandom",
            "parameters": {},
            "weight": 100
        }
        sMooclets([...mooclets, newMOOClet]);

        handleOpen(newId);
    };

    const handleMOOCletModalClose = () => {
        sMoocletModalOpen(false);
        sIdToEdit(null);
    };

    const handleMOOCletWeightChange = (event, myId) => {
        let data = [...mooclets];
        let mooclet = data.find(mooclet => mooclet.id === myId);
        mooclet['weight'] = event.target.value;
        sMooclets(data);
    }

    const handleMOOCletRemove = (myId) => {
        let Tree = [...mooclets];
        function removeNode(id) {
            // Find the index of the node with the given id
            const nodeIndex = Tree.findIndex((node) => node.id === id);

            if (nodeIndex !== -1) {
                const node = Tree[nodeIndex];
                const childIds = getChildIds(node.id);

                // Remove the node from the Tree
                Tree.splice(nodeIndex, 1);

                // Remove the descendants recursively
                childIds.forEach(removeNode);
            }
        }

        function getChildIds(parentId) {
            return Tree
                .filter((node) => node.parent === parentId)
                .map((node) => node.id);
        }

        removeNode(myId);

        sMooclets(Tree);

    }


    const handleCreateStudy = () => {
        fetch('/apis/experimentDesign/study', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "deploymentName": deploymentName, // TODO: change to "deploymentId
                "studyName": studyName,
                "mooclets": mooclets,
                "variables": variables,
                "versions": versions,
                "factors": factors,
                "rewardInformation": rewardInformation
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data['status_code'] == 200) {
                    alert("Study created successfully!");
                    sTheStudies([newStudy].concat(data["studies"]));
                    sTheStudy(data['theStudy']);

                }
                else {
                    alert(data['message']);
                }
            })
    };

    const loadCurrentStudy = () => {
        fetch(`/apis/load_existing_study?deployment=${deploymentName}&study=${theStudy['name']}`)
            .then(response => response.json())
            .then(data => {
                sStatus(4);
                sMooclets(data['mooclets']);
                sStudyName(data['studyName']);
                sVariables(data['variables']);
                sVersions(data['versions']);
                sFactors(data['factors']);
                sRewardInformation(data['rewardInformation']);
                sStatus(2);
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }



    useEffect(() => {
        for (const element of mooclets) {
            element.parameters = assignerHandleVersionOrVariableDeletion(element.policy, element.parameters, factors, variables, versions);
        }
        let temp = [...mooclets];
        sMooclets(temp);
    }, [variables, versions, factors]) //TO Improve: how to do it only when variables or versions deletion?

    useEffect(() => {
        handleOpen(1);
        // TODO: Think about how to open all the mooclets from cookies.
        if (theStudy['_id']['$oid'] == 1998) {
            // TODO: Now we just make them start from empty. But in the future we should allow people to make progress on unfinished study set up!
            sStatus(1);
            sStudyName("");
            sVariables([]);
            sVersions([]);
            sFactors([]);
            sMooclets(designGraph);
            sRewardInformation({
                "name": "reward",
                "min": 0,
                "max": 1
            });
        }
        else {
            loadCurrentStudy();
        }
    }, [theStudy]);

    const handleModifyStudy = () => {
        fetch('/apis/modify_existing_study', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "deployment": deploymentName, // TODO: change to "deploymentId
                "study": studyName,
                "mooclets": mooclets,
                "variables": variables,
                "factors": factors,
                "versions": versions,
                "rewardInformation": rewardInformation
            })
        })
            .then(response => response.json())
            .then(data => {
                alert("Study modified successfully!");
            })
            .catch((error) => {
                alert("Study modification failed!")
            })
    };

    const handleResetStudy = () => {
        if (!confirm("Are you sure you want to reset the study? The study will be reverted to earliest status after last reset. The interactions/datasets associated will all be deleted.")) return;
        fetch('/apis/experimentDesign/resetStudy', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "deployment": deploymentName, // TODO: change to "deploymentId
                "study": studyName
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data['status_code'] === 200) {
                    loadCurrentStudy();
                    alert("reset successfully!")
                }
                else {
                    alert("Something is wrong.");
                }
            }).catch((error) => {
                alert("Something is wrong.");
            })
    }

    const getWeight = (node) => {
        // get all slibings.
        let siblings = mooclets.filter(mooclet => mooclet.parent === node.parent);
        // get total weights of siblings.
        let totalWeight = 0;
        for (const element of siblings) {
            totalWeight += parseInt(element.weight);
        }

        return Math.round(node.weight / totalWeight * 10000 / 100) + "%";
    };


    const handleDeleteStudy = () => {
        if (!confirm("Are you sure you want to delete the study? Everything associated to this study will be erased. This operation is NON-UNDOABLE.")) return;
        fetch('/apis/experimentDesign/deleteStudy', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "deployment": deploymentName, // TODO: change to "deploymentId
                "study": studyName
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data['status_code'] === 200) {
                    alert("Study deleted successfully!");
                    sStatus(1);
                    location.reload();
                }
                else {
                    alert("Study deletion failed!");
                }
            })
    };



    return (
        <Container>
            <Box>
                <Box sx={{ mb: 2 }}>
                    {status === 2 && <Button sx={{ m: 1 }} variant="outlined" onClick={handleModifyStudy} startIcon={<EditIcon />}>Modify</Button>}
                    {status === 2 && <Button sx={{ m: 1 }} variant="outlined" color="error" onClick={handleResetStudy} startIcon={<RestartAltIcon />}>Reset</Button>}
                    {status === 2 && <Button sx={{ m: 1 }} variant="outlined" color="error" onClick={handleDeleteStudy} startIcon={<DeleteIcon />}>Delete</Button>}
                </Box>

                {status === 1 && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="name-editor"
                    >
                        <Typography variant='h6'>Study name</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <TextField required sx={{ mb: 3 }} label="Study name" value={studyName} onChange={(e) => sStudyName(e.target.value)}></TextField>
                    </AccordionDetails>
                </Accordion>}


                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="reward-editor"
                    >
                        <Typography variant='h6'>Reward</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <RewardEditor rewardInformation={rewardInformation} sRewardInformation={sRewardInformation} />
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography variant='h6'>Variables</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <VariableEditor selectedVariables={variables} sSelectedVariables={sVariables} />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography variant='h6'>Factors & Versions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FactorsEditor allowVersionNameChange={status === 1} factors={factors} sFactors={sFactors} versions={versions} sVersions={sVersions} />


                        <VersionEditor allowVersionNameChange={status === 1} factors={factors} versions={versions} sVersions={sVersions} />
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="mooclet-graph"
                        id="mooclet-graph"
                    >
                        <Typography variant='h6'>Designer Graph</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                            {/* https://www.npmjs.com/package/@minoru/react-dnd-treeview */}
                            <Tree
                                ref={treeRef}
                                tree={mooclets}
                                rootId={0}
                                onDrop={handleDrop}
                                initialOpen={true}
                                sort={false}
                                render={(node, { depth, isOpen, onToggle }) => (
                                    <Box style={{ marginLeft: depth * 10 }}>
                                        {node.droppable && (
                                            <span onClick={onToggle}>{isOpen ? "[-]" : "[+]"}</span>
                                        )}
                                        <Typography sx={{ m: 0.5 }} variant='span' component='strong'>{node.name}</Typography>
                                        <Typography sx={{ m: 0.5 }} variant='span'>Weight:</Typography>
                                        <Input className="assigner-weight-input" type="number" variant="standard" value={node.weight} onChange={(event) => handleMOOCletWeightChange(event, node.id)} />
                                        <small>{getWeight(node)}</small>
                                        <Button onClick={() => {
                                            sIdToEdit(node.id);
                                            sMoocletModalOpen(true);
                                        }}><EditIcon /></Button>

                                        <Button onClick={() => {
                                            handleMOOCletRemove(node.id)
                                        }} color='error'> <CloseIcon /></Button>
                                    </Box>
                                )}
                            />
                        </DndProvider>
                        <Button sx={{ m: 2 }} variant="contained" onClick={addMOOClet}>Add a new Assigner</Button>
                    </AccordionDetails>
                </Accordion>


                {status === 2 && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="mooclet-graph"
                        id="mooclet-graph"
                    >
                        <Typography variant='h6'>Simulations</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SimulationEditor studyName={studyName} deploymentName={deploymentName} versions={versions} variables={variables} />
                    </AccordionDetails>
                </Accordion>
                }



                {studyName !== "" && false && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="study-api-doc"
                        id="study-api-doc"
                    >
                        <Typography variant='h6'>APIs for {studyName} in {deploymentName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <APICard studyName={studyName} deploymentName={deploymentName}></APICard>
                    </AccordionDetails>
                </Accordion>}
            </Box>

            <Box sx={{ mb: 2 }}>
                    {status === 1 && <Button sx={{ m: 1 }} variant="outlined" onClick={handleCreateStudy} startIcon={<AddCircleIcon />} fullWidth>Create</Button>}
                </Box>
            <Modal
                open={moocletModalOpen}
                onClose={handleMOOCletModalClose}
                style={{ overflow: 'scroll', height: "80%", width: "80%", margin: "5% auto" }}

            >
                <Box style={{ background: "white" }}>
                    <MOOCletEditor mooclets={mooclets} sMooclets={sMooclets} idToEdit={idToEdit} variables={variables} factors={factors} versions={versions}></MOOCletEditor>
                </Box>
            </Modal>
        </Container>
    );
}


export default StudyEditor;