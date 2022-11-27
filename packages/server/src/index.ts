import { createServer } from "http";
import { Server } from "socket.io";
import ENV from "./env";

import { ingestChange } from "./apollo"
import store from "./data";

const httpServer = createServer();
const io = new Server(httpServer, {

});

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("init", () => {
        socket.emit("init", store.data);
    });

    socket.on("change", (fragmnet: any, id: string, data: any) => {
        ingestChange(fragmnet, id, data);
        socket.broadcast.emit("change", fragmnet, id, data);
    });

    socket.on("reset", () => {
        store.data = {};
        socket.emit("seed");
    });

    socket.on("seed-done", () => {
        io.emit("reload");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

httpServer.listen(ENV.server.port, ENV.server.host, () => {
    console.log(`Server listening on ${ENV.server.host}:${ENV.server.port}`);
});
