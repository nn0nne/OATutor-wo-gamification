import React from "react";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";
import { SITE_NAME } from "../config/config";

const AssignmentNotLinked = () => {
    return <>
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
            <AppBar position="static">
                <Toolbar>
                    <Grid container spacing={0} role={"navigation"}>
                        <Grid item xs={3} key={1}>
                            <BrandLogoNav noLink={true} />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <div>
                <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
                    <Box width="75%" maxWidth={1500}>
                        <center>
                            <h1>Welcome to {SITE_NAME.replace(/\s/, "")}!</h1>
                            <h2>Your instructor has not linked a lesson to this assignment yet.</h2>
                        </center>
                        <Divider />
                        <center>
                            <Spacer />

                            {/* Gamification Preview */}
                            <div style={{
                                margin: '20px 0',
                                padding: '20px',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '8px',
                                maxWidth: '600px',
                                textAlign: 'left'
                            }}>
                                <h3 style={{ color: '#0066cc', marginBottom: '16px' }}>🎮 What to Expect</h3>
                                <p>When your instructor links a lesson, you'll be able to:</p>
                                <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                                    <li>🏆 <strong>Earn badges</strong> for completing problems and lessons</li>
                                    <li>⭐ <strong>Collect points</strong> to be the first on the course leaderboard</li>
                                    <li>📊 <strong>See your points and progress</strong> on the class leaderboard</li>
                                    <li>🎯 <strong>Track your mastery</strong> of the learning objectives</li>
                                </ul>
                                <p style={{ fontStyle: 'italic', marginTop: '12px' }}>
                                    Check back later when your instructor has set up the assignment!
                                </p>
                            </div>

                            <Spacer height={24 * 3} />
                        </center>
                    </Box>
                </Grid>

                {/* <Grid */}
                {/*     container */}
                {/*     spacing={0} */}
                {/*     direction="column" */}
                {/*     alignItems="center" */}
                {/*     justifyContent="center" */}
                {/* > */}
                {/*     <Box width="75%" maxWidth={1500}> */}
                {/*         <center> */}
                {/*             <h1>Welcome to {SITE_NAME.replace(/\s/, "")}!</h1> */}
                {/*             <h2>Your instructor has not linked a lesson to this assignment yet.</h2> */}
                {/*         </center> */}
                {/*         <Divider/> */}
                {/*         <center> */}
                {/*             <Spacer/> */}
                {/*             <p>Please check back later.</p> */}
                {/*             <Spacer height={24 * 3}/> */}
                {/*         </center> */}
                {/*     </Box> */}
                {/* </Grid> */}
            </div>
        </div>
    </>
}

export default AssignmentNotLinked
