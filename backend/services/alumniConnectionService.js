import Connection from '../models/connection.js';
import User from '../models/user.js';
import ErrorResponse from '../utils/errorResponse.js';


/**
 * Alumni Connection Service
 * Provides utilities for managing connections between alumni and students
 */

const getUserConnections = async (userId) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        })
            .populate('requester', 'name avatar bio currentCompany designation linkedin github')
            .populate('recipient', 'name avatar bio currentCompany designation linkedin github')
            .sort('-updatedAt');

        return connections;
    } catch (error) {
        throw new Error(`Failed to fetch connections: ${error.message}`);
    }
};

const getPendingRequests = async (userId) => {
    try {
        const requests = await Connection.find({
            recipient: userId,
            status: 'pending'
        })
            .populate('requester', 'name avatar bio currentCompany designation branch graduationYear')
            .sort('-createdAt');

        return requests;
    } catch (error) {
        throw new Error(`Failed to fetch pending requests: ${error.message}`);
    }
};

const getSentRequests = async (userId) => {
    try {
        const requests = await Connection.find({
            requester: userId,
            status: 'pending'
        })
            .populate('recipient', 'name avatar bio currentCompany designation')
            .sort('-createdAt');

        return requests;
    } catch (error) {
        throw new Error(`Failed to fetch sent requests: ${error.message}`);
    }
};

const sendConnectionRequest = async (requesterId, recipientId, message, mentorshipDetails = null) => {
    try {
        const requester = await User.findById(requesterId);
        const recipient = await User.findById(recipientId);

        if (!requester || !recipient) throw new Error('User not found');
        if (requesterId === recipientId) throw new Error('You cannot send a request to yourself');

        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });
        if (existingConnection) throw new Error('Connection already exists or request is pending');

        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
            message,
            mentorshipRequest: !!mentorshipDetails,
            mentorshipDetails: mentorshipDetails || undefined
        });

        await connection.populate('requester', 'name avatar');
        await connection.populate('recipient', 'name avatar');

        return connection;
    } catch (error) {
        throw new Error(`Failed to send connection request: ${error.message}`);
    }
};

const acceptAlumniConnection = async (connectionId, userId) => {
    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.recipient.toString() !== userId)
            throw new Error('You are not authorized to accept this request');

        connection.status = 'accepted';
        if (connection.mentorshipRequest) {
            connection.mentorshipDetails.status = 'active';
            connection.mentorshipDetails.startDate = new Date();
        }

        await connection.save();
        await connection.populate('requester', 'name avatar bio currentCompany designation');
        await connection.populate('recipient', 'name avatar bio currentCompany designation');

        return connection;
    } catch (error) {
        throw new Error(`Failed to accept connection: ${error.message}`);
    }
};

const rejectConnectionRequest = async (connectionId, userId) => {
    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.recipient.toString() !== userId)
            throw new Error('You are not authorized to reject this request');

        connection.status = 'rejected';
        await connection.save();

        return connection;
    } catch (error) {
        throw new Error(`Failed to reject connection: ${error.message}`);
    }
};

const deleteConnection = async (connectionId, userId) => {
    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) throw new Error('Connection not found');

        if (
            connection.requester.toString() !== userId &&
            connection.recipient.toString() !== userId
        ) {
            throw new Error('You are not authorized to delete this connection');
        }

        await Connection.findByIdAndRemove(connectionId);

        return { success: true, message: 'Connection deleted successfully' };
    } catch (error) {
        throw new Error(`Failed to delete connection: ${error.message}`);
    }
};

const getConnectionStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const acceptedConnections = await Connection.countDocuments({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        });

        const pendingRequests = await Connection.countDocuments({
            recipient: userId,
            status: 'pending'
        });

        const sentRequests = await Connection.countDocuments({
            requester: userId,
            status: 'pending'
        });

        const mentorshipConnections = await Connection.countDocuments({
            $or: [{ requester: userId }, { recipient: userId }],
            mentorshipRequest: true,
            status: 'accepted'
        });

        return {
            totalConnections: acceptedConnections,
            pendingRequests,
            sentRequests,
            mentorshipConnections
        };
    } catch (error) {
        throw new Error(`Failed to fetch connection stats: ${error.message}`);
    }
};

const getAlumniRecommendations = async (userId, limit = 10) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const existingConnections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }]
        }).select('requester recipient');

        const connectedUserIds = new Set();
        existingConnections.forEach(conn => {
            connectedUserIds.add(conn.requester.toString());
            connectedUserIds.add(conn.recipient.toString());
        });

        const recommendations = await User.find({
            _id: { $nin: Array.from(connectedUserIds) },
            role: 'alumni',
            isVerified: true,
            $or: [{ branch: user.branch }, { skills: { $in: user.skills } }]
        })
            .select('name avatar bio currentCompany designation branch skills linkedin')
            .limit(limit);

        return recommendations;
    } catch (error) {
        throw new Error(`Failed to fetch alumni recommendations: ${error.message}`);
    }
};

const searchAlumni = async (query, filters = {}) => {
    try {
        let searchQuery = {
            role: 'alumni',
            isVerified: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } },
                { currentCompany: { $regex: query, $options: 'i' } },
                { skills: { $in: [new RegExp(query, 'i')] } }
            ]
        };

        if (filters.branch) searchQuery.branch = filters.branch;
        if (filters.company) searchQuery.currentCompany = { $regex: filters.company, $options: 'i' };
        if (filters.graduationYear) searchQuery.graduationYear = filters.graduationYear;

        const alumni = await User.find(searchQuery)
            .select('name avatar bio currentCompany designation branch skills linkedin graduationYear')
            .limit(20);

        return alumni;
    } catch (error) {
        throw new Error(`Failed to search alumni: ${error.message}`);
    }
};

const updateMentorshipDetails = async (connectionId, userId, mentorshipDetails) => {
    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) throw new Error('Connection not found');

        if (
            connection.requester.toString() !== userId &&
            connection.recipient.toString() !== userId
        ) {
            throw new Error('You are not authorized to update this connection');
        }

        if (!connection.mentorshipRequest)
            throw new Error('This is not a mentorship connection');

        connection.mentorshipDetails = {
            ...connection.mentorshipDetails,
            ...mentorshipDetails
        };

        await connection.save();
        return connection;
    } catch (error) {
        throw new Error(`Failed to update mentorship details: ${error.message}`);
    }
};

const getMentorshipConnections = async (userId) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
            mentorshipRequest: true,
            status: 'accepted'
        })
            .populate('requester', 'name avatar bio currentCompany designation')
            .populate('recipient', 'name avatar bio currentCompany designation')
            .sort('-updatedAt');

        return connections;
    } catch (error) {
        throw new Error(`Failed to fetch mentorship connections: ${error.message}`);
    }
};

// ✅ Export all functions using module.exports
export {
    getUserConnections,
    getPendingRequests,
    getSentRequests,
    sendConnectionRequest,
    acceptAlumniConnection,
    rejectConnectionRequest,
    deleteConnection,
    getConnectionStats,
    getAlumniRecommendations,
    searchAlumni,
    updateMentorshipDetails,
    getMentorshipConnections
};


