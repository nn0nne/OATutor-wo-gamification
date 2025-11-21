import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from "firebase/firestore";

const Leaderboard = ({ classes, leaderboardService, currentUserId, onClose, firebase }) => {
    const [topUsers, setTopUsers] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('points'); // points, lessons, problems
    const [viewMode, setViewMode] = useState('table'); // table, cards, compact
    const [filteredUsers, setFilteredUsers] = useState([]);


    const fetchUserName = useCallback(async (userId) => {
        if (!firebase?.db) return 'Anonymous Student';

        try {
            const userRef = doc(firebase.db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                return userData.studentName || 'Anonymous Student';
            }
            return 'Anonymous Student';
        } catch (error) {
            console.error('Error fetching user name:', error);
            return 'Anonymous Student';
        }
    }, [firebase?.db]);

    const enhanceUsersWithNames = useCallback(async (users) => {
        const enhancedUsers = await Promise.all(
            users.map(async (user) => {
                if (user.displayName && user.displayName !== 'Anonymous Student') {
                    return user;
                }
                const userName = await fetchUserName(user.id);
                return {
                    ...user,
                    displayName: userName
                };
            })
        );
        return enhancedUsers;
    }, [fetchUserName]);

    const loadLeaderboard = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [users, rank] = await Promise.all([
                leaderboardService.getTopUsers(50), // Get more users for filtering
                leaderboardService.getUserRank()
            ]);

            const enhancedUsers = await enhanceUsersWithNames(users);
            setTopUsers(enhancedUsers);
            setUserRank(rank);

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            setError('Failed to load leaderboard');
        } finally {
            setIsLoading(false);
        }
    }, [leaderboardService, enhanceUsersWithNames]);

    const filterAndSortUsers = useCallback(() => {
        let filtered = [...topUsers];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort users
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'lessons':
                    return (b.totalLessonsCompleted || 0) - (a.totalLessonsCompleted || 0);
                case 'problems':
                    return (b.totalProblemsCompleted || 0) - (a.totalProblemsCompleted || 0);
                case 'points':
                default:
                    return (b.points || 0) - (a.points || 0);
            }
        });

        setFilteredUsers(filtered);
    }, [topUsers, searchTerm, sortBy]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#007bff';
        }
    };


    useEffect(() => {
        loadLeaderboard();
        const interval = setInterval(loadLeaderboard, 30000);
        return () => clearInterval(interval);
    }, [loadLeaderboard]);

    useEffect(() => {
        filterAndSortUsers();
    }, [filterAndSortUsers]);

    if (error) {
        return (
            <div style={{ minWidth: '800px', maxWidth: '1200px', padding: '20px' }}>
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h3>Unable to Load Leaderboard</h3>
                    <p>{error}</p>
                    <button
                        onClick={loadLeaderboard}
                        style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minWidth: '800px', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    🏆 Class Leaderboard
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                )}
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p>Loading leaderboard...</p>
                </div>
            ) : (
                <div>
                    {/* Controls Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Sort By */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="points">Sort by Points</option>
                                <option value="lessons">Sort by Lessons</option>
                                <option value="problems">Sort by Problems</option>
                            </select>
                        </div>

                        {/* View Mode */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setViewMode('table')}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${viewMode === 'table' ? '#007bff' : '#ddd'}`,
                                    borderRadius: '4px',
                                    backgroundColor: viewMode === 'table' ? '#007bff' : 'white',
                                    color: viewMode === 'table' ? 'white' : '#333',
                                    cursor: 'pointer'
                                }}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${viewMode === 'cards' ? '#007bff' : '#ddd'}`,
                                    borderRadius: '4px',
                                    backgroundColor: viewMode === 'cards' ? '#007bff' : 'white',
                                    color: viewMode === 'cards' ? 'white' : '#333',
                                    cursor: 'pointer'
                                }}
                            >
                                Cards
                            </button>
                            <button
                                onClick={() => setViewMode('compact')}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${viewMode === 'compact' ? '#007bff' : '#ddd'}`,
                                    borderRadius: '4px',
                                    backgroundColor: viewMode === 'compact' ? '#007bff' : 'white',
                                    color: viewMode === 'compact' ? 'white' : '#333',
                                    cursor: 'pointer'
                                }}
                            >
                                Compact
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={loadLeaderboard}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    {/* Summary Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ padding: '16px', backgroundColor: '#e8f5e8', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                                {filteredUsers.length}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Students</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
                                {filteredUsers.reduce((sum, user) => sum + (user.points || 0), 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Total Points</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
                                {filteredUsers.reduce((sum, user) => sum + (user.totalLessonsCompleted || 0), 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Lessons Completed</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#fce4ec', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                                {filteredUsers.reduce((sum, user) => sum + (user.totalProblemsCompleted || 0), 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Problems Solved</div>
                        </div>
                    </div>

                    {/* User Rank Display */}
                    {userRank && userRank > 10 && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: '2px solid #007bff',
                            textAlign: 'center'
                        }}>
                            <strong>Your current rank: #{userRank}</strong>
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                Keep going to climb the leaderboard!
                            </div>
                        </div>
                    )}

                    {/* Leaderboard Content - Different Views */}
                    {viewMode === 'table' && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '80px' }}>Rank</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Student</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '100px' }}>Points</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '100px' }}>Lessons</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef', width: '100px' }}>Problems</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            style={{
                                                backgroundColor: user.id === currentUserId ? '#e3f2fd' : (index % 2 === 0 ? '#f8f9fa' : 'white'),
                                                borderLeft: user.id === currentUserId ? '4px solid #007bff' : 'none'
                                            }}
                                        >
                                            <td style={{
                                                padding: '12px',
                                                borderBottom: '1px solid #e9ecef',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: getRankColor(index + 1)
                                            }}>
                                                {getRankIcon(index + 1)}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                                                <div>
                                                    <div style={{
                                                        fontWeight: user.id === currentUserId ? 'bold' : '500',
                                                        color: user.id === currentUserId ? '#007bff' : '#333'
                                                    }}>
                                                        {user.displayName}
                                                        {user.id === currentUserId && (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                backgroundColor: '#007bff',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px'
                                                            }}>YOU</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                borderBottom: '1px solid #e9ecef',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                color: '#007bff'
                                            }}>
                                                {user.points || 0}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                                                {user.totalLessonsCompleted || 0}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                                                {user.totalProblemsCompleted || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === 'cards' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '16px',
                            maxHeight: '600px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {filteredUsers.map((user, index) => (
                                <LeaderboardCard
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}

                    {viewMode === 'compact' && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                            {filteredUsers.map((user, index) => (
                                <div key={user.id} style={{
                                    padding: '12px',
                                    backgroundColor: user.id === currentUserId ? '#e3f2fd' : (index % 2 === 0 ? '#f8f9fa' : 'white'),
                                    borderBottom: '1px solid #e9ecef',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: user.id === currentUserId ? '4px solid #007bff' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            backgroundColor: getRankColor(index + 1),
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontWeight: user.id === currentUserId ? 'bold' : '500',
                                                color: user.id === currentUserId ? '#007bff' : '#333'
                                            }}>
                                                {user.displayName}
                                                {user.id === currentUserId && ' (You)'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {user.points || 0} points
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                                        <span>📚 {user.totalLessonsCompleted || 0}</span>
                                        <span>💡 {user.totalProblemsCompleted || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Results Info */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        Showing {filteredUsers.length} of {topUsers.length} students
                        {searchTerm && ` matching "${searchTerm}"`}
                        {filteredUsers.length === 0 && topUsers.length > 0 && ' - No matches found'}
                    </div>
                </div>
            )}
        </div>
    );
};

// Leaderboard Card Component for Card View
const LeaderboardCard = ({ user, index, currentUserId }) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#007bff';
        }
    };

    return (
        <div style={{
            padding: '16px',
            backgroundColor: user.id === currentUserId ? '#e3f2fd' : 'white',
            borderRadius: '8px',
            border: '2px solid',
            borderColor: user.id === currentUserId ? '#007bff' : '#e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                    }}>
                        <h4 style={{
                            margin: 0,
                            color: user.id === currentUserId ? '#007bff' : '#333',
                            fontWeight: user.id === currentUserId ? 'bold' : '500'
                        }}>
                            {user.displayName}
                        </h4>
                        {user.id === currentUserId && (
                            <span style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>YOU</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                        <span>⭐ {user.points || 0} points</span>
                        <span>📚 {user.totalLessonsCompleted || 0} lessons</span>
                        <span>💡 {user.totalProblemsCompleted || 0} problems</span>
                    </div>
                </div>
                <div style={{
                    backgroundColor: getRankColor(index + 1),
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '50px',
                    textAlign: 'center'
                }}>
                    {getRankIcon(index + 1)}
                </div>
            </div>

            {/* Achievement Badge for Top 3 */}
            {index < 3 && (
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '16px',
                    backgroundColor: getRankColor(index + 1),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                }}>
                    {index === 0 ? 'CHAMPION' : index === 1 ? 'RUNNER UP' : 'TOP 3'}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
