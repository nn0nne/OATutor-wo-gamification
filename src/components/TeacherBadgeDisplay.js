import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';

const TeacherBadgeDisplay = ({ firebase, browserStorage }) => {
    const [studentBadges, setStudentBadges] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('points'); // points, name, badges, lessons, problems
    const [viewMode, setViewMode] = useState('cards'); // cards, table, compact
    const [filterByBadge, setFilterByBadge] = useState('all'); // all, has-badges, no-badges

    const loadAllStudentBadges = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const usersRef = collection(firebase.db, 'users');
            const querySnapshot = await getDocs(usersRef);

            if (querySnapshot.empty) {
                setStudentBadges([]);
                setLoading(false);
                return;
            }

            const students = [];

            for (const docSnapshot of querySnapshot.docs) {
                const userId = docSnapshot.id;
                const userData = docSnapshot.data();

                const hasActivity = userData.points > 0 ||
                    (userData.badges && userData.badges.length > 0) ||
                    userData.totalLessonsCompleted > 0 ||
                    userData.totalProblemsCompleted > 0;

                if (hasActivity) {
                    students.push({
                        id: userId,
                        studentName: userData.studentName || 'Unknown Student',
                        badges: userData.badges || [],
                        totalPoints: userData.points || 0,
                        totalLessonsCompleted: userData.totalLessonsCompleted || 0,
                        totalProblemsCompleted: userData.totalProblemsCompleted || 0
                    });
                }
            }

            setStudentBadges(students);

        } catch (error) {
            console.error('Error loading student badges:', error);
            setError('Failed to load student data: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [firebase?.db]);

    const filterAndSortStudents = useCallback(() => {
        let filtered = [...studentBadges];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by badge status
        if (filterByBadge === 'has-badges') {
            filtered = filtered.filter(student => student.badges.length > 0);
        } else if (filterByBadge === 'no-badges') {
            filtered = filtered.filter(student => student.badges.length === 0);
        }

        // Sort students
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.studentName.localeCompare(b.studentName);
                case 'badges':
                    return b.badges.length - a.badges.length;
                case 'lessons':
                    return b.totalLessonsCompleted - a.totalLessonsCompleted;
                case 'problems':
                    return b.totalProblemsCompleted - a.totalProblemsCompleted;
                case 'points':
                default:
                    return b.totalPoints - a.totalPoints;
            }
        });

        setFilteredStudents(filtered);
    }, [studentBadges, searchTerm, sortBy, filterByBadge]);

    const getTopBadges = () => {
        const badgeCounts = {};
        studentBadges.forEach(student => {
            student.badges.forEach(badge => {
                badgeCounts[badge.name] = (badgeCounts[badge.name] || 0) + 1;
            });
        });
        return Object.entries(badgeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };


    useEffect(() => {
        loadAllStudentBadges();
    }, [loadAllStudentBadges]);

    useEffect(() => {
        filterAndSortStudents();
    }, [filterAndSortStudents]);


    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>Loading student progress data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3>Unable to Load Student Data</h3>
                <p>{error}</p>
            </div>
        );
    }

    const topBadges = getTopBadges();

    return (
        <div style={{ minWidth: '800px', maxWidth: '1200px' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                🏆 Student Progress - Loops Programming Course
            </h2>

            {studentBadges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                    <h3>No Student Activity Yet</h3>
                    <p>Student progress will appear here once students start working on programming problems.</p>
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
                                <option value="name">Sort by Name</option>
                                <option value="badges">Sort by Badges</option>
                                <option value="lessons">Sort by Lessons</option>
                                <option value="problems">Sort by Problems</option>
                            </select>
                        </div>

                        {/* Filter by Badges */}
                        <div>
                            <select
                                value={filterByBadge}
                                onChange={(e) => setFilterByBadge(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Students</option>
                                <option value="has-badges">With Badges</option>
                                <option value="no-badges">Without Badges</option>
                            </select>
                        </div>

                        {/* View Mode */}
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                                {filteredStudents.length}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Showing</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
                                {filteredStudents.reduce((sum, student) => sum + student.badges.length, 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Total Badges</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef6c00' }}>
                                {filteredStudents.reduce((sum, student) => sum + student.totalLessonsCompleted, 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Lessons Completed</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#fce4ec', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                                {filteredStudents.reduce((sum, student) => sum + student.totalProblemsCompleted, 0)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555' }}>Problems Solved</div>
                        </div>
                    </div>

                    {/* Top Badges Summary */}
                    {topBadges.length > 0 && (
                        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>🏅 Most Popular Badges</h4>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {topBadges.map(([badgeName, count]) => (
                                    <div key={badgeName} style={{
                                        padding: '8px 12px',
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        border: '1px solid #b3d9ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>{badgeName}</span>
                                        <span style={{
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            borderRadius: '10px',
                                            padding: '2px 6px',
                                            fontSize: '10px',
                                            minWidth: '20px',
                                            textAlign: 'center'
                                        }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Student List - Different Views */}
                    {viewMode === 'cards' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '16px',
                            maxHeight: '600px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {filteredStudents.map((student, index) => (
                                <StudentCard key={student.id} student={student} index={index} />
                            ))}
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Rank</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Student</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Points</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Badges</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Lessons</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Problems</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student, index) => (
                                        <tr key={student.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                                                #{index + 1}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                                                    {student.badges.length > 0 && (
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                            {student.badges.slice(0, 2).map(badge => badge.icon).join(' ')}
                                                            {student.badges.length > 2 && ` +${student.badges.length - 2} more`}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center', fontWeight: 'bold' }}>
                                                {student.totalPoints}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                                                {student.badges.length}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                                                {student.totalLessonsCompleted}
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                                                {student.totalProblemsCompleted}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === 'compact' && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                            {filteredStudents.map((student, index) => (
                                <div key={student.id} style={{
                                    padding: '12px',
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #e9ecef',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            backgroundColor: '#007bff',
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
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {student.badges.length} badges • {student.totalPoints} points
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                                        <span>📚 {student.totalLessonsCompleted}</span>
                                        <span>💡 {student.totalProblemsCompleted}</span>
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
                        Showing {filteredStudents.length} of {studentBadges.length} students
                        {searchTerm && ` matching "${searchTerm}"`}
                        {filterByBadge !== 'all' && ` (${filterByBadge === 'has-badges' ? 'with badges' : 'without badges'})`}
                    </div>
                </div>
            )}
        </div>
    );
};

// Student Card Component for Card View
const StudentCard = ({ student, index }) => {
    return (
        <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>
                        {student.studentName}
                        {index === 0 && student.totalPoints > 0 && (
                            <span style={{
                                marginLeft: '8px',
                                backgroundColor: '#ffd700',
                                color: '#8b6b00',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>🥇 TOP</span>
                        )}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                        <span>🏆 {student.badges.length}</span>
                        <span>⭐ {student.totalPoints}</span>
                        <span>📚 {student.totalLessonsCompleted}</span>
                        <span>💡 {student.totalProblemsCompleted}</span>
                    </div>
                </div>
                <div style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    #{index + 1}
                </div>
            </div>

            {/* Badge Display */}
            {student.badges.length > 0 ? (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {student.badges.slice(0, 4).map(badge => (
                        <div key={badge.id} style={{
                            padding: '4px 8px',
                            backgroundColor: '#e7f3ff',
                            borderRadius: '12px',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid #b3d9ff'
                        }} title={`${badge.name}: ${badge.description}`}>
                            <span style={{ fontSize: '12px' }}>{badge.icon}</span>
                            <span style={{ fontWeight: '500' }}>{badge.name}</span>
                        </div>
                    ))}
                    {student.badges.length > 4 && (
                        <div style={{
                            padding: '4px 8px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#666',
                            border: '1px dashed #ddd'
                        }}>
                            +{student.badges.length - 4} more
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic', marginTop: '8px' }}>
                    No badges earned yet
                </div>
            )}
        </div>
    );
};

export default TeacherBadgeDisplay;
