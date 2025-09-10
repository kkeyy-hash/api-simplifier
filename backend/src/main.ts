// Dependencies //
import Express, { Request, Response, Application, Router } from "express";
import Filesystem from "fs";
import Path from "path";

const App: Application = Express();


// Configuration //
App.use(Express.json());
App.use(Express.urlencoded({ extended: true }));
App.set("json spaces", 2);


// API routes //
const RoutesPath: string = Path.join(__dirname, "routes");
Filesystem.readdirSync(RoutesPath).forEach((File: string) => {
    if (File.endsWith(".js")) { // .js due to using tsc + node
        import(Path.join(RoutesPath, File))
        .then((RouteModule: { default: Router }) => {
            const Route: Router = RouteModule.default || RouteModule;
            const RouteName: string = File.replace(".js", "");

            App.use(`/api/${RouteName}`, Route);
            console.log(`Loaded route /api/${RouteName}`);
        })
        .catch((Error: unknown) => console.error("Failed to load route:", File, Error));
    };
});


// Listener //
App.listen(80, () => {
    return console.log(`Express is listening at http://localhost:80/`);
});