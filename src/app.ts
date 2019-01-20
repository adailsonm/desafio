import * as express from 'express';
import * as bodyParser from 'body-parser';
import { CustomerContact } from "./routes/CustomerContact";

class App {
    
    public app: express.Application;
    public customerRoutes: CustomerContact = new CustomerContact();

    constructor() {
        this.app = express();
        this.config();
        this.customerRoutes.routes(this.app);
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true,
        }));
    }
}

export default new App().app;