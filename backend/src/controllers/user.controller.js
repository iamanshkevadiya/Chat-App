import FriendRequest from "../models/friendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;
        const recommendedUsers =  await User.find({
            $and:[
                {_id: { $ne: currentUserId }},
                {id:{ $nin: currentUser.friends }},
                {isOnboarded: true}
            ]
        })
        res.status(200).json(recommendedUsers);
    }
    catch (error) {
        console.log("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id).select("friends").populate("friends", "fullName profilePic bio learningLanguage");  

        res.status(200).json({ friends: user.friends });
    } catch (error) {
        
        console.log("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function sendfriendRequest(req, res) {
    try {
        const myid = req.user.id;
        const {id:recipientId} = req.params;

        if(myid === recipientId) {
            return res.status(400).json({ message: "You cannot send  friend request to yourself" });
        }

        const recipient = await User.findById(recipientId)
        if(!recipient) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        if(recipient.friendRequests.includes(myid)) {
            return res.status(400).json({ message: "You are already friends with this User" });
        }

        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender: myid, recipient: recipientId},
                {sender: recipientId, recipient: myid}
            ]
        });

        if(existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this user" });
        }

        const friendshipRequest = new FriendRequest.create({
            sender: myid,
            recipient: recipientId
        });

        await friendshipRequest.save();

        res.status(200).json(friendshipRequest);
    } catch (error) {
        console.log("Error in sendfriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptfriendRequest(req, res) {
    try {
        const {id:requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();
        
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        }); 
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }    
        });

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        
        console.log("Error in acceptfriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}