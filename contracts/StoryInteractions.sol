pragma solidity ^0.8.9;

contract StoryInteractions {
    // page id to profiles who have liked that publication
    mapping(string => string[]) public pageToProfileLikes;
    // profile id to stories that the profile follows. Can only follow posts, not comments
    mapping(string => string[]) public profileToFollowedStories;

    function getPageLikes(string memory pageId) external view returns (uint256) {
        return pageToProfileLikes[pageId].length;
    }

    function doesProfileLikePage(string memory profileId, string memory pageId) public view returns (bool) {
        if (pageToProfileLikes[pageId].length > 0) {
            for (uint256 i = 0; i < pageToProfileLikes[pageId].length; i++) {
                if (
                    keccak256(abi.encodePacked(pageToProfileLikes[pageId][i])) == keccak256(abi.encodePacked(profileId))
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function likePage(string memory profileId, string memory pageId) external {
        require(!doesProfileLikePage(profileId, pageId), "This profile already likes this page");
        pageToProfileLikes[pageId].push(profileId);
    }

    function unlikePage(string memory profileId, string memory pageId) external {
        if (pageToProfileLikes[pageId].length > 0) {
            uint256 pageLikeCount = pageToProfileLikes[pageId].length;
            for (uint256 i = 0; i < pageLikeCount; i++) {
                if (
                    keccak256(abi.encodePacked(pageToProfileLikes[pageId][i])) == keccak256(abi.encodePacked(profileId))
                ) {
                    pageToProfileLikes[pageId][i] = pageToProfileLikes[pageId][pageLikeCount - 1];
                    pageToProfileLikes[pageId].pop();
                    break;
                }
            }
        }
    }

    function getFollowedStories(string memory profileId) external view returns (string[] memory) {
        return profileToFollowedStories[profileId];
    }

    function doesProfileFollowStory(string memory profileId, string memory pageId) public view returns (bool) {
        if (profileToFollowedStories[profileId].length > 0) {
            for (uint256 i = 0; i < profileToFollowedStories[profileId].length; i++) {
                if (
                    keccak256(abi.encodePacked(profileToFollowedStories[profileId][i])) ==
                    keccak256(abi.encodePacked(pageId))
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function followStory(string memory profileId, string memory pageId) external {
        require(!doesProfileFollowStory(profileId, pageId), "This profile already follows this story");
        profileToFollowedStories[profileId].push(pageId);
    }

    function unfollowStory(string memory profileId, string memory pageId) external {
        if (profileToFollowedStories[profileId].length > 0) {
            uint256 storyFollowCount = profileToFollowedStories[profileId].length;
            for (uint256 i = 0; i < storyFollowCount; i++) {
                if (
                    keccak256(abi.encodePacked(profileToFollowedStories[profileId][i])) ==
                    keccak256(abi.encodePacked(pageId))
                ) {
                    profileToFollowedStories[profileId][i] = profileToFollowedStories[profileId][storyFollowCount - 1];
                    profileToFollowedStories[profileId].pop();
                    break;
                }
            }
        }
    }
}
