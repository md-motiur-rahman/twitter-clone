import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {useQuery} from "@tanstack/react-query"
import { useEffect } from "react";

const Posts = ({ feedtype }) => {
  

  const getFeedEndpoint = () => {
    switch (feedtype) {
      case "forYou":
        return "/api/post/all";
      case "following":
        return "/api/post/getfollowingposts";
      default:
        return "/api/post/all";
    }
  };

  const POST_ENDPOINT = getFeedEndpoint();

  const {data: posts, isLoading, refetch, isRefetching} = useQuery({
	queryKey: ["posts"],
	queryFn: async () => {
		try {
			const response = await fetch(POST_ENDPOINT);
			const data = await response.json();
			if(!response.ok){
				throw new Error(data.error || "Something went wrong")
			}
			return data;
		} catch (error) {
			throw new Error(error.message)
		}
	}
  })

  useEffect(() => {
	refetch();
  }, [feedtype, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching &&  posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
