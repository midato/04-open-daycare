import FeedPostCard from "@/app/components/FeedPostCard";
import Sidebar from "@/app/components/Sidebar";
import { posts } from "@/app/lib/data";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar />
      <div className="p-8">
        <FeedPostCard post={posts[0]} />
      </div>
    </div>
  );
}
