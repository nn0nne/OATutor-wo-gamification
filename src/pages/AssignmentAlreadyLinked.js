import React, { useContext, useState, useEffect } from "react";
import { findLessonById, _lessonPlansNoEditor, ThemeContext } from "../config/config";
import { AppBar, Box, Toolbar, Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";
import Leaderboard from "../components/Leaderboard";
import { LeaderboardService } from "../services/LeaderboardService";
import TeacherBadgeDisplay from "../components/TeacherBadgeDisplay";

const AssignmentAlreadyLinked = (props) => {
    const lessonPlans = _lessonPlansNoEditor;
    const context = useContext(ThemeContext);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showTeacherBadgeDisplay, setShowTeacherBadgeDisplay] = useState(false);
    const [leaderboardService, setLeaderboardService] = useState(null);

    const _linkedLesson = +context.alreadyLinkedLesson
    const linkedLesson = !isNaN(_linkedLesson)
        ? lessonPlans[+context.alreadyLinkedLesson]
        : context.alreadyLinkedLesson.length > 1 ?
            findLessonById(context.alreadyLinkedLesson) :
            null

    const isPrivileged = context.user?.privileged || false;

    useEffect(() => {
        if (isPrivileged && context.userID) {
            const lbService = new LeaderboardService(
                context.firebase,
                context.browserStorage,
                context.userID,
                true
            );
            setLeaderboardService(lbService);
        }
    }, [isPrivileged, context.userID, context.firebase, context.browserStorage]);

    const toggleLeaderboard = () => {
        setShowLeaderboard(prev => !prev);
    };

    const toggleTeacherBadgeDisplay = () => {
        setShowTeacherBadgeDisplay(prev => !prev);
    };

    console.debug("linkedLesson", linkedLesson)

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
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box width="75%" maxWidth={1500}>
                        <center>
                            {linkedLesson
                                ? <h1>This assignment has been linked to
                                    lesson {linkedLesson.name} {linkedLesson.topic} successfully!</h1>
                                : <h1>This assignment has been linked successfully!</h1>
                            }
                            <h2>To link a new OATutor lesson, please create a new assignment on your LMS.</h2>
                            <h2>To preview the lesson, click on "Student View" on Canvas.</h2>
                        </center>

                        {/* Teacher Controls */}
                        {isPrivileged && (
                            <div style={{ margin: "20px 0", display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={toggleTeacherBadgeDisplay}
                                    size="large"
                                    startIcon={<span>🏆</span>}
                                >
                                    View Student Badges
                                </Button>

                                {leaderboardService && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={toggleLeaderboard}
                                        size="large"
                                        startIcon={<span>📊</span>}
                                        style={{ backgroundColor: "#ff6b35" }}
                                    >
                                        View Class Leaderboard
                                    </Button>
                                )}
                            </div>
                        )}

                        <Divider />
                        <center>
                            <Spacer />
                            {linkedLesson
                                && <>
                                    <p>Course Name: {linkedLesson.courseName}</p>
                                    <p>Lesson Name: {linkedLesson.name} {linkedLesson.topics}</p>
                                </>
                            }
                            <Spacer height={24 * 4} />
                        </center>
                    </Box>
                </Grid>
            </div>

            {/* Teacher Badge Display Modal */}
            {showTeacherBadgeDisplay && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                }} onClick={toggleTeacherBadgeDisplay}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        minWidth: '300px',
                        width: '900px'
                    }}>
                        <TeacherBadgeDisplay
                            firebase={context.firebase}
                            browserStorage={context.browserStorage}
                            courseId={context.user?.course_id}
                            resourceLinkId={context.user?.resource_link_id}
                        />
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button onClick={toggleTeacherBadgeDisplay} variant="contained" color="primary">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Modal */}
            {showLeaderboard && leaderboardService && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                }} onClick={toggleLeaderboard}>
                    <div onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            minWidth: '300px',
                            width: '900px'
                        }}
                    >
                        <Leaderboard
                            leaderboardService={leaderboardService}
                            currentUserId={context.userID}
                            onClose={toggleLeaderboard}
                            firebase={context.firebase}
                        />
                    </div>
                </div>
            )}
        </div>
    </>
}

export default AssignmentAlreadyLinked
