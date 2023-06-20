import { React, useContext, useState, useEffect } from 'react';
import { Typography, Paper, TextField, Box, Grid, Divider, Button, Container } from '@mui/material';
import Layout from '../components/layout';
import Head from 'next/head';
import Select from 'react-select';
import StudyEditor from '../components/ManageDeploymentPage/StudyEditor';
import { UserContext } from "../contexts/UserContextWrapper";


const newStudy = {
    "name": "Create New Study",
    "_id": { "$oid": "1998" }
}

function ManageDeployment() {
    const [myDeployments, sMyDeployments] = useState([]);
    const [theStudies, sTheStudies] = useState([]);
    const [theStudy, sTheStudy] = useState(null);
    const [deploymentName, sDeploymentName] = useState(null);

    const { userContext, sUserContext } = useContext(UserContext);
    useEffect(() => {
        if (userContext !== undefined && userContext === null) {
            window.location.href = "/Login";
        }
    }, [userContext]);

    useEffect(() => {
        fetch('/apis/my_deployments')
            .then(response => response.json())
            .then(data => {
                sMyDeployments(data["my_deployments"]);
            });
    }, []);

    const handleSelectMyDeployment = (option) => {
        fetch(`/apis/the_studies/?deployment_id=${option["_id"]["$oid"]}`)
            .then(response => response.json())
            .then(data => {
                sTheStudies([newStudy].concat(data["studies"]));
                sDeploymentName(option['name'])
            });
    }

    const handleSelectStudy = (option) => {
        sTheStudy(option);
    }

    if (userContext !== undefined && userContext !== null) {
        return (
            <Layout>
                <Head><title>Manage Deployment - DataArrow</title></Head>
                <Container>
                    <Box>
                        <Typography variant="p">Deployment: </Typography>
                        <Select
                            options={myDeployments}
                            getOptionLabel={(option) => option["name"]}
                            getOptionValue={(option) => option["_id"]["$oid"]}
                            onChange={(option) => handleSelectMyDeployment(option)}
                        />
                    </Box>


                    <Box>
                        <Typography variant="p">Study: </Typography>
                        <Select
                            options={theStudies}
                            getOptionLabel={(option) => option["name"]}
                            getOptionValue={(option) => option["_id"]["$oid"]}
                            value={theStudy}
                            onChange={(option) => handleSelectStudy(option)}
                        />
                    </Box>
                </Container>
                {theStudy && <StudyEditor deploymentName={deploymentName} theStudy={theStudy}></StudyEditor>}
            </Layout>
        );
    }
}


export default ManageDeployment;