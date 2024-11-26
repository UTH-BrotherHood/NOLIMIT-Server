import { Router } from "express";
import { createGroupController } from "~/controllers/group.controller";
import { createGroupValidation } from "~/middlewares/groups.middleware";
import { accessTokenValidation } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const groupsRouter = Router();

/*
Description: This route is used to get all groups of a user joined
Path: /group
Method: GET
*/
groupsRouter.get('/', accessTokenValidation, wrapRequestHandler(createGroupController));

/*
Description: This route is used to create a new group
Path: /group
Method: POST
Body: { group_name: String, members: [String], creator: String }
*/
groupsRouter.post('/', accessTokenValidation, createGroupValidation, wrapRequestHandler(createGroupController));

/*
Description: This route is used to get group basic information
Path: /group/:group_id
Method: GET
*/
groupsRouter.get('/:group_id', accessTokenValidation, wrapRequestHandler(createGroupController));

/*
Description: This route is used to update group information
Path: /group
Method: PUT
Body: { group_id: String, group_name: String , members: [String], avatar: String }
Middleware: accessTokenValidation, groupOwnerValidation, groupExistsValidation
*/
groupsRouter.put('/', accessTokenValidation, wrapRequestHandler(createGroupController));

/*
Description: This route is used to delete a group
Path: /group
Method: DELETE
Body: { group_id: String }
Middleware: accessTokenValidation, groupOwnerValidation, groupExistsValidation
*/
groupsRouter.delete('/:group_id', accessTokenValidation, wrapRequestHandler(createGroupController));


/*
Description: This route is used to join a group
Path: /group/join
Method: POST
Body: { group_id: String }
*/
groupsRouter.post('/join', accessTokenValidation, wrapRequestHandler(createGroupController));

/*
Description: This route is used to leave a group
Path: /group/leave
Method: POST
Body: { group_id: String }
*/
groupsRouter.post('/leave', accessTokenValidation, wrapRequestHandler(createGroupController));



export default groupsRouter;