import React, { useState, useEffect } from 'react';

const BadgeDisplay = ({ userId, firebase, browserStorage, pointsService }) => {
    const [badges, setBadges] = useState([]);
    const [newBadges, setNewBadges] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [progress, setProgress] = useState(null);
    const [showBadgeModal, setShowBadgeModal] = useState(false);

    useEffect(() => {
        if (!pointsService) return;


        const loadBadges = async () => {
            if (pointsService) {
                const earnedBadges = await pointsService.getEarnedBadges();
                setBadges(earnedBadges);
            }
        };

        const updateProgress = () => {
            if (pointsService) {
                const currentProgress = pointsService.getCurrentProgress();
                setProgress(currentProgress);
            }
        };

        // Set up badge update callback
        pointsService.setBadgeUpdateCallback((newBadges) => {
            setNewBadges(newBadges);
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            loadBadges();
        });

        // Load existing badges
        loadBadges();
        updateProgress();

        const progressInterval = setInterval(updateProgress, 3000);
        return () => clearInterval(progressInterval);
    }, [pointsService]);


    const toggleBadgeModal = () => {
        setShowBadgeModal(prev => !prev);
    };

    // Helper functions for badge progress
    const getBadgeProgress = (badgeId) => {
        if (!progress) return null;
        const badgeDefinitions = {
            'first_problem': { target: 1, current: progress.totalProblemsCompleted + progress.sessionProblemsCompleted },
            'lesson_master': { target: 3, current: progress.totalLessonsCompleted + progress.sessionLessonsCompleted },
            'problem_solver': { target: 12, current: progress.totalProblemsCompleted + progress.sessionProblemsCompleted }
        };
        return badgeDefinitions[badgeId];
    };

    const isBadgeInProgress = (badgeId) => {
        const badgeProgress = getBadgeProgress(badgeId);
        if (!badgeProgress) return false;
        return badgeProgress.current > 0 && badgeProgress.current < badgeProgress.target;
    };

    const getBadgeProgressPercentage = (badgeId) => {
        const badgeProgress = getBadgeProgress(badgeId);
        if (!badgeProgress) return 0;
        return Math.min(100, (badgeProgress.current / badgeProgress.target) * 100);
    };

    const isBadgeEarned = (badgeId) => {
        return badges.some(badge => badge.id === badgeId);
    };

    // Define all badges
    const allBadges = [
        {
            id: 'first_problem',
            name: 'First Step',
            description: 'Complete your first problem',
            icon: '🚀',
            target: 1
        },
        {
            id: 'lesson_master',
            name: 'Lesson Master',
            description: 'Complete 3 lessons',
            icon: '🎓',
            target: 3
        },
        {
            id: 'problem_solver',
            name: 'Problem Solver',
            description: 'Complete 12 problems',
            icon: '💡',
            target: 12
        }
    ];

    return (
        <div style={{ position: 'relative' }}>
            {/* Badge Notification */}
            {showNotification && newBadges.length > 0 && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    minWidth: '300px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎉 New Badges Earned!
                    </h4>
                    {newBadges.map(badge => (
                        <div key={badge.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '8px 0',
                            padding: '8px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px'
                        }}>
                            <span style={{ fontSize: '24px', marginRight: '10px' }}>{badge.icon}</span>
                            <div style={{ flex: 1 }}>
                                <strong>{badge.name}</strong>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>{badge.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Compact Badge Display - Just a button with count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    onClick={toggleBadgeModal}
                    style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        backgroundColor: badges.length > 0 ? '#e3f2fd' : '#f5f5f5'
                    }}
                    title="View badges and progress"
                >
                    <span>🏆</span>
                    <span>{badges.length}</span>
                </button>

                {/* Progress Summary Only */}
                {progress && (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: '#e7f3ff',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#0066cc',
                        whiteSpace: 'nowrap'
                    }}>
                        <strong>Problems:</strong> {progress.totalProblemsCompleted + progress.sessionProblemsCompleted} •
                        <strong> Lessons:</strong> {progress.totalLessonsCompleted + progress.sessionLessonsCompleted}
                    </div>
                )}
            </div>

            {/* Badge Modal */}
            {showBadgeModal && (
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
                }} onClick={toggleBadgeModal}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            minWidth: '300px',
                            width: '600px'
                        }}
                    >
                        <h2 style={{ color: '#0066cc', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏆 Your Badges & Progress
                        </h2>

                        {/* Progress Summary */}
                        {progress && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '12px',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#0066cc'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '8px' }}>
                                    <span><strong>Total Problems:</strong> {progress.totalProblemsCompleted + progress.sessionProblemsCompleted}</span>
                                    <span><strong>Total Lessons:</strong> {progress.totalLessonsCompleted + progress.sessionLessonsCompleted}</span>
                                </div>
                                {progress.sessionProblemsCompleted > 0 && (
                                    <div style={{ fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                                        {progress.sessionProblemsCompleted} problems completed this session
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '16px',
                            marginTop: '16px'
                        }}>
                            {allBadges.map(badge => {
                                const isEarned = isBadgeEarned(badge.id);
                                const badgeProgress = getBadgeProgress(badge.id);
                                const inProgress = isBadgeInProgress(badge.id);
                                const progressPercentage = getBadgeProgressPercentage(badge.id);
                                const currentBadge = badges.find(b => b.id === badge.id);

                                return (
                                    <div key={badge.id} style={{
                                        padding: '16px',
                                        backgroundColor: isEarned ? '#f0f9ff' : '#f8f9fa',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        border: isEarned ? '2px solid #4CAF50' : '2px solid #e9ecef',
                                        position: 'relative',
                                        opacity: isEarned ? 1 : (inProgress ? 1 : 0.6)
                                    }} title={badge.description}>
                                        <div style={{
                                            fontSize: '32px',
                                            marginBottom: '8px',
                                            filter: isEarned ? 'none' : (inProgress ? 'none' : 'grayscale(100%)')
                                        }}>
                                            {badge.icon}
                                        </div>
                                        <div style={{
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            color: isEarned ? '#2e7d32' : '#495057'
                                        }}>
                                            {badge.name}
                                        </div>

                                        {isEarned ? (
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#4CAF50',
                                                marginTop: '4px',
                                                fontWeight: 'bold'
                                            }}>
                                                ✓ Earned
                                            </div>
                                        ) : (
                                            <div style={{
                                                fontSize: '10px',
                                                color: inProgress ? '#ff9800' : '#6c757d',
                                                marginTop: '4px'
                                            }}>
                                                {badgeProgress ? `${badgeProgress.current}/${badge.target}` : `0/${badge.target}`}
                                            </div>
                                        )}

                                        {/* Progress bar for in-progress badges */}
                                        {inProgress && !isEarned && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '12px',
                                                right: '12px',
                                                height: '4px',
                                                backgroundColor: '#e9ecef',
                                                borderRadius: '2px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    backgroundColor: '#4CAF50',
                                                    width: `${progressPercentage}%`,
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        )}

                                        {/* Earned date for earned badges */}
                                        {isEarned && currentBadge && (
                                            <div style={{
                                                fontSize: '9px',
                                                color: '#666',
                                                marginTop: '2px'
                                            }}>
                                                {new Date(currentBadge.earnedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={toggleBadgeModal}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default BadgeDisplay;
