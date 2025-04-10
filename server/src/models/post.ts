interface Post {
    id: number;
    authorId: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export default Post;