import { Request, Response } from "express";
import * as fs from 'fs';
import db = require('../../db.json');


export class CustomerContact {
    public routes(app): void {
        //Listar todos os horários
        app.route('/atendimentos')
        .get((req: Request,res: Response) => {
            res.status(200).send(db);
        });
        // Listar horários a partir do dia
        app.route('/atendimento/:day')
        .get((req:Request, res: Response) => {
            const day = req.params.day;
            const atendimento = db.atendimentos.find(atendimento => atendimento.day === day)
            res.status(200).send(atendimento);
        })
        // Listar dias disponíveis a partir de um range de datas
        app.route('/atendimento/:dayInicio/:dayFin')
            .get((req: Request, res: Response) => {
                const intervalDayIn = req.params.dayInicio;
                const intervalDayFin = req.params.dayFin;
                const atendimento = db.atendimentos.filter(atendimento => atendimento.day >= intervalDayIn && atendimento.day <= intervalDayFin)
                res.status(200).send(atendimento);
            })
        /* 
        Route opcional criada com pensando que seria necessaria... 
        para listar os intervalos
        daquele dia a partir de um horário 
        */
        app.route('/atendimento/:day/:start/:end')
        .get((req:Request, res: Response) => {
            const day = req.params.day;
            const start = req.params.start;
            const end = req.params.end;
            const atendimento = db.atendimentos.find(atendimento => atendimento.day === day)
            const intervals = atendimento.intervals.filter(interval => interval.start >= start && interval.end <= end)
            const result = {
                ...atendimento,
                intervals
            }
            res.status(200).send(result);
        })
        //Mini Interpectador de roteamento para criação dos intervalos e adição ao array principal
        const transformData = (req: Request, res: Response, next) => {
            const data = [{
                start: req.params.start,
                end: req.params.end
            }]   
            req.params.intervals = data;
            next();
        }
        // Rotas para enviar dados de atendimento completo com os intervalos.
        app.route('/atendimentos')
        .post(transformData, ({ body }, res: Response) => {
            const data = {
                day: body.day,
                intervals: body.intervals
            }
            
            db.atendimentos.push(data);
            
            fs.writeFileSync('db.json', JSON.stringify(db), 'utf8');
            res.status(201).send("Dado inserido com sucesso");

        });
        //Deleção de atendimento a partir do dia somente excluindo o dia em questão e remontando o array
        app.route('/atendimento/:day')
        .delete((req: Request, res: Response) => {
            const day = req.params.day;
            const Data = db.atendimentos.filter(DateFilter => DateFilter.day !== day);
            const newArray = {
                atendimentos: Data
            }
            if(Data !== undefined) {
                fs.writeFileSync('db.json', JSON.stringify(newArray), 'utf8');
                res.status(200).send("Dado removido com sucesso");

            } else {                
                res.status(404);
                throw Error("Nenhuma data foi cadastrada para este dia, porisso não conseguimos remover");
            }
        })
    }
}