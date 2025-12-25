import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log("Event received:", JSON.stringify(event));

    try {
        // ✅ SAFE BODY PARSING
        const body = typeof event.body === "string"
            ? JSON.parse(event.body)
            : event.body;

        if (!body || !body.task) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    error: "Missing required field: task"
                })
            };
        }

        const todoItem = {
            id: Date.now().toString(),
            task: body.task,
            completed: body.completed ?? false,
            createdAt: new Date().toISOString()
        };

        await dynamodb.send(
            new PutCommand({
                TableName: "TodosTable", // ⚠️ ensure this name exists
                Item: todoItem
            })
        );

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                message: "Todo created successfully",
                todo: todoItem
            })
        };

    } catch (error) {
        console.error("Error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: "Internal server error",
                details: error.message
            })
        };
    }
};
