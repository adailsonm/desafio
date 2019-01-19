import { Request, Response } from "express";
import * as fs from 'fs';
import customerContact = require('../db.json');

interface ICustomerContact {
    day: string;
    intervals: Array<Object>;
}

export class CustomerContact {
    public routes(app): void {
        app.route('/atendimentos')
        .get((res: Response) => {
            res.status(200).send(customerContact);
        });
        app.route('/atendimentos/:day')
        .get((req:Request, res: Response) => {
            let day = req.params.day;
            res.status(200).send(customerContact[day]);
        })
        app.route('/atendimentos')
        .post((req: Request, res: Response) => {
            let Contact: any  =  {
                day: req.body.day,  //this requires body-parser package
                intervals: [{
                    start: req.body.start,
                    end: req.body.end
                }]
            };
            let data = JSON.stringify(Contact);
            fs.writeFileSync(customerContact, data, (error) => {
                if(error) throw error;
                console.log("Dados inseridos com sucesso");
            });
        })
    }
}