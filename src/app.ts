import * as express from 'express';
import * as bodyParser from 'body-parser';
import { CustomerContact } from "./routes/CustomerContact";
import * as moment from 'moment';
class App {
    
    public app: express.Application;
    public customerRoutes: CustomerContact = new CustomerContact();

    constructor() {
        this.app = express();
        this.config();
        this.customerRoutes.routes(this.app);
        moment.defineLocale('pt-BR',null);
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true,
        }));
    }
}

export default new App().app;