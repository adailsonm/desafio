import { Request, Response } from "express";
import * as fs from 'fs';
import db = require('../../db.json');


export class CustomerContact {
    public routes(app): void {
        app.route('/atendimentos')
        .get((req: Request,res: Response) => {
            res.status(200).send(db);
        });
        app.route('/atendimento/:day')
        .get((req:Request, res: Response) => {
            let day = req.params.day;
            let Data = db.atendimentos.filter(DateFilter => DateFilter.day === day);
            res.status(200).send(Data);
        })
        app.route('/atendimentos')
        .post((req: Request, res: Response) => {
            const data = {
                day: req.body.day,
                intervals: []
            }
            data.intervals.forEach((element) => {
                data.intervals.push("teste")
            })
            db.atendimentos.push(data);
            fs.writeFileSync('db.json', JSON.stringify(db), 'utf8');
        });
    }
}