// import React, { useContext, useState, useEffect } from "react";
import React, { useContext, useState } from "react";
// import { findLessonById, _lessonPlansNoEditor, ThemeContext, findCourseByLessonId, _coursePlansNoEditor } from "../config/config";
import { findLessonById, ThemeContext, findCourseByLessonId } from "../config/config";
import { AppBar, Box, Toolbar, Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";
import { withRouter } from "react-router-dom";
// import Leaderboard from "@components/Leaderboard"
// import BadgeDisplay from "@components/BadgeDisplay"
// import { PointsService } from "../services/PointsService"
// import { LeaderboardService } from "../services/LeaderboardService"
import { toast } from "react-toastify";

const AssignmentFinished = (props) => {
    const { history, location } = props;
    const context = useContext(ThemeContext);

    // const [showLeaderboard, setShowLeaderboard] = useState(false);
    // const [leaderboardService, setLeaderboardService] = useState(null);

    // const [showBadges, setShowBadges] = useState(false);
    // const [badges, setBadges] = useState([]);
    // const [progress, setProgress] = useState(null);

    const [isResetting, setIsResetting] = useState(false);

    // const [pointsService, setPointsService] = useState(null);

    // Get lesson ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const lessonIdFromUrl = urlParams.get('lesson');

    // Try multiple sources for lesson ID
    const currentLessonId = lessonIdFromUrl ||
        context.currentLesson ||
        context.alreadyLinkedLesson;

    const lesson = currentLessonId ? findLessonById(currentLessonId) : null;

    // Find course - try multiple approaches
    let course = null;
    if (lesson) {
        course = findCourseByLessonId(currentLessonId);
    } else if (context.user?.course_name) {
        // Fallback to context course info
        course = { courseName: context.user.course_name };
    }

    // Check if we're in standalone mode
    const isStandalone = !context.user?.resource_link_id;

    const isPrivileged = context.user?.privileged || false;

    // Initialize services
    // useEffect(() => {
    //     if (context.userID) {
    //         const isLMSUser = PointsService.isLMSUser(context);
    //
    //         // Initialize points service for badges
    //         const ptsService = new PointsService(
    //             context.firebase,
    //             context.browserStorage,
    //             context.userID,
    //             isLMSUser,
    //             context
    //         );
    //         setPointsService(ptsService);
    //
    //         // Initialize the points service first, then load data
    //         const initializeData = async () => {
    //             try {
    //                 // Initialize user data in PointsService (this loads from Firebase)
    //                 await ptsService.initializeUserData();
    //
    //                 // Now load badges and progress
    //                 await loadBadgesAndProgress(ptsService);
    //             } catch (error) {
    //                 console.error('Error initializing data:', error);
    //             }
    //         };
    //
    //         initializeData();
    //
    //         // Initialize leaderboard service for non-privileged users
    //         if (!isPrivileged) {
    //             const lbService = new LeaderboardService(
    //                 context.firebase,
    //                 context.browserStorage,
    //                 context.userID,
    //                 isLMSUser
    //             );
    //             setLeaderboardService(lbService);
    //         }
    //
    //         // Load badges
    //         ptsService.getEarnedBadges().then(earnedBadges => {
    //             setBadges(earnedBadges);
    //         });
    //     }
    // }, [context, isPrivileged]);

    // const loadBadgesAndProgress = async (ptsService) => {
    //     const earnedBadges = await ptsService.getEarnedBadges();
    //     setBadges(earnedBadges);
    //
    //     // Get current progress
    //     // const currentProgress = ptsService.getCurrentProgress();
    //     // setProgress(currentProgress);
    // };

    const goToMainMenu = () => {
        history.push("/");
    };

    // const toggleLeaderboard = () => {
    //     setShowLeaderboard(prev => !prev);
    // };
    //
    // const toggleBadges = () => {
    //     setShowBadges(prev => !prev);
    // };

    // Helper functions for badge progress (similar to BadgeDisplay.js)
    // const getBadgeProgress = (badgeId) => {
    //     if (!progress) return null;
    //
    //     const badgeDefinitions = {
    //         'first_problem': {
    //             target: 1,
    //             current: progress.totalProblemsCompleted + progress.sessionProblemsCompleted
    //         },
    //         'lesson_master': {
    //             target: 5,
    //             current: progress.totalLessonsCompleted + progress.sessionLessonsCompleted
    //         },
    //         'problem_solver': {
    //             target: 50,
    //             current: progress.totalProblemsCompleted + progress.sessionProblemsCompleted
    //         }
    //     };
    //
    //     return badgeDefinitions[badgeId];
    // };

    const handleResetProgress = async () => {
        if (!currentLessonId) {
            toast.error("No lesson identified to reset");
            return;
        }

        setIsResetting(true);
        try {
            const success = await context.removeLessonProgress(currentLessonId);

            if (success) {
                toast.success("Lesson progress has been reset. You can restart the lesson.");
                // Redirect setelah reset selesai
                setTimeout(() => {
                    history.push(`/lessons/${currentLessonId}`);
                }, 2000);
            }
        } catch (error) {
            console.error("Error resetting lesson progress:", error);
            toast.error("Failed to reset lesson progress");
        } finally {
            setIsResetting(false);
        }
    };

    console.log("AssignmentFinished debug:", {
        lessonIdFromUrl,
        currentLessonId,
        lesson,
        course,
        contextUser: context.user,
        isPrivileged,
        showLeaderboardForStudents: !isPrivileged
    });

    return (
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20, minHeight: "100vh" }}>
            <AppBar position="static">
                <Toolbar>
                    <Grid container spacing={0} role={"navigation"}>
                        <Grid item xs={3} key={1}>
                            <BrandLogoNav noLink={true} />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Box width="75%" maxWidth={1500} textAlign="center" mt={6}>
                    <h1>🎉 You've completed this lesson!</h1>

                    {course && (
                        <h2 style={{ color: "#555", marginBottom: "8px" }}>
                            {course.courseName}
                        </h2>
                    )}

                    {lesson ? (
                        <>
                            <h3 style={{ marginTop: "0px", marginBottom: "16px" }}>
                                {lesson.name}: {lesson.topics}
                            </h3>
                            <Divider style={{ margin: "20px 0" }} />
                        </>
                    ) : (
                        <p>Lesson information not available</p>
                    )}

                    <div>
                        <p>Great job! You've reached the mastery for this lesson.</p>

                        {!isStandalone && (
                            <p style={{ marginTop: '10px' }}>Your score has been submitted to your instructor.</p>
                        )}
                    </div>

                    {/* Badge and Leaderboard Buttons */}
                    {/* {!isPrivileged && !isStandalone && ( */}
                    {/*     <div style={{ margin: "20px 0", display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}> */}
                    {/*         <Button */}
                    {/*             variant="contained" */}
                    {/*             color="primary" */}
                    {/*             onClick={toggleBadges} */}
                    {/*             size="large" */}
                    {/*             startIcon={<span>🏆</span>} */}
                    {/*             style={{ */}
                    {/*                 marginBottom: "20px", */}
                    {/*                 fontWeight: 'bold' */}
                    {/*             }} */}
                    {/*         > */}
                    {/*             View My Badges ({badges.length}) */}
                    {/*         </Button> */}
                    {/**/}
                    {/*         {leaderboardService && ( */}
                    {/*             <Button */}
                    {/*                 variant="contained" */}
                    {/*                 color="secondary" */}
                    {/*                 onClick={toggleLeaderboard} */}
                    {/*                 size="large" */}
                    {/*                 startIcon={<span>📊</span>} */}
                    {/*                 style={{ */}
                    {/*                     marginBottom: "20px", */}
                    {/*                     backgroundColor: "#ff6b35", */}
                    {/*                     fontWeight: 'bold' */}
                    {/*                 }} */}
                    {/*             > */}
                    {/*                 View Class Leaderboard */}
                    {/*             </Button> */}
                    {/*         )} */}
                    {/*     </div> */}
                    {/* )} */}

                    {isStandalone && (
                        <>
                            <p>You can return to the main menu to select another lesson.</p>
                            <Spacer height={24} />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={goToMainMenu}
                                size="large"
                            >
                                Back to Main Menu
                            </Button>
                        </>
                    )}

                    {!isPrivileged && !isStandalone && (
                        <div style={{ margin: "20px 0", display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Existing buttons... */}

                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleResetProgress}
                                disabled={isResetting}
                                size="large"
                                startIcon={<span>🔄</span>}
                                style={{
                                    marginBottom: "20px",
                                    borderColor: "#ff6b35",
                                    color: "#ff6b35"
                                }}
                            >
                                {isResetting || context.isResettingLesson ? "Resetting..." : "Reset This Lesson"}
                            </Button>
                        </div>
                    )}

                    <Spacer height={48} />
                </Box>
            </Grid>

            {/* Badge Modal using BadgeDisplay Component */}
            {/* {showBadges && pointsService && ( */}
            {/*     <div style={{ */}
            {/*         position: 'fixed', */}
            {/*         top: 0, */}
            {/*         left: 0, */}
            {/*         right: 0, */}
            {/*         bottom: 0, */}
            {/*         backgroundColor: 'rgba(0,0,0,0.5)', */}
            {/*         display: 'flex', */}
            {/*         justifyContent: 'center', */}
            {/*         alignItems: 'center', */}
            {/*         zIndex: 2000, */}
            {/*     }} onClick={toggleBadges}> */}
            {/*         <div */}
            {/*             onClick={(e) => e.stopPropagation()} */}
            {/*             style={{ */}
            {/*                 backgroundColor: 'white', */}
            {/*                 borderRadius: '12px', */}
            {/*                 padding: '24px', */}
            {/*                 maxWidth: '90vw', */}
            {/*                 maxHeight: '80vh', */}
            {/*                 overflow: 'auto', */}
            {/*                 minWidth: '300px', */}
            {/*                 width: '600px' */}
            {/*             }} */}
            {/*         > */}
            {/*             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}> */}
            {/*                 <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}> */}
            {/*                     🏆 Your Badges & Progress */}
            {/*                 </h2> */}
            {/*                 <button */}
            {/*                     onClick={toggleBadges} */}
            {/*                     style={{ */}
            {/*                         padding: '8px 16px', */}
            {/*                         backgroundColor: '#6c757d', */}
            {/*                         color: 'white', */}
            {/*                         border: 'none', */}
            {/*                         borderRadius: '4px', */}
            {/*                         cursor: 'pointer', */}
            {/*                         fontSize: '14px' */}
            {/*                     }} */}
            {/*                 > */}
            {/*                     Close */}
            {/*                 </button> */}
            {/*             </div> */}

            {/* Use the BadgeDisplay component here */}
            {/*             <BadgeDisplay */}
            {/*                 userId={context.userID} */}
            {/*                 firebase={context.firebase} */}
            {/*                 browserStorage={context.browserStorage} */}
            {/*                 pointsService={pointsService} */}
            {/*             /> */}
            {/*         </div> */}
            {/*     </div> */}
            {/* )} */}

            {/* Leaderboard Modal */}
            {/* {showLeaderboard && leaderboardService && ( */}
            {/*     <div style={{ */}
            {/*         position: 'fixed', */}
            {/*         top: 0, */}
            {/*         left: 0, */}
            {/*         right: 0, */}
            {/*         bottom: 0, */}
            {/*         backgroundColor: 'rgba(0,0,0,0.5)', */}
            {/*         display: 'flex', */}
            {/*         justifyContent: 'center', */}
            {/*         alignItems: 'center', */}
            {/*         zIndex: 2000, */}
            {/*     }} onClick={toggleLeaderboard}> */}
            {/*         <div onClick={(e) => e.stopPropagation()} */}
            {/**/}
            {/*             style={{ */}
            {/*                 backgroundColor: 'white', */}
            {/*                 borderRadius: '12px', */}
            {/*                 padding: '24px', */}
            {/*                 maxWidth: '90vw', */}
            {/*                 maxHeight: '80vh', */}
            {/*                 overflow: 'auto', */}
            {/*                 minWidth: '300px', */}
            {/*                 width: '900px' */}
            {/*             }} */}
            {/*         > */}
            {/*             <Leaderboard */}
            {/*                 leaderboardService={leaderboardService} */}
            {/*                 currentUserId={context.userID} */}
            {/*                 onClose={toggleLeaderboard} */}
            {/*                 firebase={context.firebase} */}
            {/*             /> */}
            {/*         </div> */}
            {/*     </div> */}
            {/* )} */}
        </div>
    );
};

export default withRouter(AssignmentFinished);
