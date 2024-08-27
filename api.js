const db = require("./db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getPost =  async(event) => {
    const response = { statusCode: 200};

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),
        };
        const { Item } = await db.send(new GetItemCommand(params));                 //db is the client that we intiated in begining

        console.log({ Item });
        response.body = JSON.stringify({
            message: "successfully retrieved post.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to get post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
return response;
};

const createPost =  async(event) => {
    const response = { statusCode: 200};

    try{
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));                 //db is the client that we intiated in begining

        response.body = JSON.stringify({
            message: "successfully created post.",
            createResult,
        });
    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to create post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
return response;
};

const updatePost =  async(event) => {
    const response = { statusCode: 200};

    try{
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),

        };
        const updateResult = await db.send(new UpdateItemCommand(params));                 //db is the client that we intiated in begining

        response.body = JSON.stringify({
            message: "successfully updated post.",
            updateResult,
        });
    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to update post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
return response;
};

const deletePost =  async(event) => {
    const response = { statusCode: 200};

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),

        };
        const deleteResult = await db.send(new DeleteItemCommand(params));                 //db is the client that we intiated in begining

        response.body = JSON.stringify({
            message: "successfully deleted post.",
            deleteResult,
        });
    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to delete post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
return response;
};

const getAllPosts =  async(event) => {
    const response = { statusCode: 200};

    try{
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME}));                //LastEvaluated key one of the key retuned by getallpost help subsequent scans coz there is a limit in scancommand

        response.body = JSON.stringify({
            message: "successfully retrieved all posts.",
            data: Items.map(( item ) => unmarshall(item)),
            Items,
        });
    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to retrieve post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
return response;
};



module.exports = {
    getPost,
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
}