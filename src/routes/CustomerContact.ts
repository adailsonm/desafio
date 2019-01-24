import { Request, Response } from "express";
import * as fs from 'fs';
import db = require('../../db.json');
import * as moment from 'moment';

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
            const daySplit = day.split('-').reverse();
            const formattedDay = new Date(daySplit);
            const dayWeek = formattedDay.getDay();
            const week = new Array(6);
            week[0]='Domingo';
            week[1]='Segunda-feira';
            week[2]='Terça-feira';
            week[3]='Quarta-feira';
            week[4]='Quinta-feira';
            week[5]='Sexta-feira';
            week[6]='Sábado';

            const atendimento = db.atendimentos.filter(atendimento => atendimento.day === day || atendimento.recurrence === 'Diariamente' || 
                atendimento.weekDay.findIndex(someDay => someDay.weekDay === week[dayWeek]))  
            res.status(200).send(atendimento);
        })
        // Listar dias disponíveis a partir de um range de datas
        app.route('/atendimento/:dayInicio/:dayFin')
            .get((req: Request, res: Response) => {
                const intervalDayIn = req.params.dayInicio;
                const intervalDayFin = req.params.dayFin;
                const daySplitIn = intervalDayIn.split('-').reverse();
                const daySplitFin = intervalDayFin.split('-').reverse();
                const formattedDayIn = new Date(daySplitIn);
                const formattedDayFin = new Date(daySplitFin);
                const dayWeekIn = formattedDayIn.getDay();
                const dayWeekFin = formattedDayFin.getDay();

                const week = new Array(6);
                week[0]='Domingo';
                week[1]='Segunda-feira';
                week[2]='Terça-feira';
                week[3]='Quarta-feira';
                week[4]='Quinta-feira';
                week[5]='Sexta-feira';
                week[6]='Sábado';


                const atendimento = db.atendimentos.filter(atendimento => 
                    moment(atendimento.day, 'DD-MM-YYYY').toDate() >= formattedDayIn  && moment(atendimento.day, 'DD-MM-YYYY').toDate() <= formattedDayFin || 
                    atendimento.recurrence === 'Diariamente' || atendimento.weekDay.findIndex(someDay => someDay.weekDay == week[dayWeekIn] || someDay.weekDay == week[dayWeekFin]))
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
            const intervalsTime = [{
                start: req.params.start,
                end: req.params.end
            }]   
            req.params.intervals = intervalsTime;
            next();
        }
        // Rotas para enviar dados de atendimento completo com os intervalos.
        app.route('/atendimentos')
        .post(transformData, ({ body }, res: Response) => {
            const data = {
                day: body.day,
                intervals: body.intervals,
                recurrence: body.recurrence,
                weekDay: body.weekDay,
            }

            if(data.day.length && data.weekDay == '') {
                data.recurrence = 'Específico';
                data.weekDay = []; 
            } else if (data.day == '' && data.weekDay.length) {
                data.recurrence = 'Semanal';
                data.day = null
            }
            const dayExist = db.atendimentos.filter(atendimento => atendimento.day === body.day);
            if(data.day.length && dayExist.length) {

                dayExist.forEach(element => {
                    element.intervals.push(...body.intervals);
                })               

            } else {
                db.atendimentos.push(data);
            }
            
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

        app.route('/atendimento/remover/:recurrence')
        .delete((req: Request, res: Response) => {
            const recurrence = req.params.recurrence;
            if(recurrence !== 'Específico' || recurrence !== 'especifico') {
                const Data = db.atendimentos.filter(recurrenceFilter => recurrenceFilter.recurrence !== recurrence);
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
            } else {
                res.status(404);
                throw Error('Você não pode excluir uma recorrência especifica tente METHOD: DELETE - ENDPOINT: /atendimento/:day');
            }
        })
    }
}