import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

    // Override create to associate the post with the authenticated user
    async create(req: Request, res: Response) {
        const userId = req.params.userId;  // Get the userId from the middleware
        const post = { ...req.body, owner: userId };  // Attach the userId to the post
        req.body = post;
        super.create(req, res);
    }
}

export default new PostsController();
