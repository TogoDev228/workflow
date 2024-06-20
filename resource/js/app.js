const express = require('express')
const mysql = require('mysql')
const myconnection = require('express-myconnection')
const bodyParser = require('body-parser')
const session = require('express-session')

const optionBd = {
    host : 'localhost',
    user : 'root',
    password : '',
    port : 3306,
    database : 'workflow'
}

const app = express()

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for MySQL connection
app.use(myconnection(mysql, optionBd, 'pool'));

// Middleware pour gèrer la session
app.use(session({
    secret: 'abcd', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Should be true in a production environment with HTTPS
}));

// Pour utiliser le module ejs
app.set('view engine', 'ejs')
app.set('views','page') // A cause de cela nous ne precisons pas page(dossier page dans l'hierachie)



app.get('/',(req,rep)=>{
    rep.status(200).render('login') 
})



app.get('/register',(req,rep)=>{
    rep.status(200).render('register')
})

// enregistrement des utilisateur - client side
app.post('/register-info',(req,rep)=>{

    let nom = req.body.nom
    let prenom = req.body.prenom
    let email = req.body.email
    let pswd = req.body.pswd
    let statut = req.body.statut

    req.getConnection((err,con)=>{
        if(err){
            console.log(err)
        }else{
            con.query("INSERT INTO user(nom, prenom, email, pswd, statut) VALUES (?, ?, ?, ?, ?)",[nom, prenom, email, pswd, statut],(err,res)=>{
                if(err){
                    console.log(err)
                }else{
                    rep.status(300).redirect('/')
                }
            })
        }
    })
})


// login des utilisateur - client side
app.post('/login-info',(req,rep)=>{

    let nom = req.body.nom
    let pswd = req.body.pswd

    req.getConnection((err,con)=>{
        if(err){
            console.log(err)
        }else{
            con.query("SELECT * FROM user WHERE nom = ? AND pswd = ?",[nom, pswd],(err,res)=>{
                if(err){
                    console.log(err)
                }

                if(res.length > 0){

                    req.session.user = {
                        id: res[0].id,
                        nom: res[0].nom,
                        prenom: res[0].prenom,
                        email: res[0].email,
                        pswd: res[0].pswd,
                        statut: res[0].statut,
                       
                    }

                    if(res[0].statut === 909){
                        rep.status(300).redirect('/admin')
                    }

                    if(res[0].statut > 0 && res[0].statut <= 10){
                        rep.status(300).redirect('/backOffice')
                    }
                    
                    if(res[0].statut === 0){
                        rep.status(300).redirect('/dashboard')
                    }
                   
                }else{
                    rep.status(300).redirect('/register')
                }
            })
        }
    })
})



// enregistrement des utilisateur backoffice - côté administrateur
app.post('/register-info-admin',(req,rep)=>{

    let nom = req.body.nom
    let prenom = req.body.prenom
    let email = req.body.email
    let pswd = req.body.pswd
    let statut = req.body.statut

    req.getConnection((err,con)=>{
        if(err){
            console.log(err)
        }else{
            con.query("INSERT INTO user(nom, prenom, email, pswd, statut) VALUES (?, ?, ?, ?, ?)",[nom, prenom, email, pswd, statut],(err,res)=>{
                if(err){
                    console.log(err)
                }else{
                    rep.status(300).redirect('/admin-add')
                }
            })
        }
    })
})

// Le Dashboard de l'administrateur
app.get('/admin', async (req, rep) => {

    if(!req.session.user){
        rep.redirect('/');
    }else{
        try {
            const con = await new Promise((resolve, reject) => {
                req.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(connection);
                    }
                });
            });

            const simpleUser = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM user WHERE statut = 0", [], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            const backOfficeUser = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM user WHERE statut = 1", [], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            rep.status(200).render('admin/admin', { simpleUser, backOfficeUser });
        } catch (err) {
            console.log(err);
            rep.status(500).send('Une erreur s\'est produite');
        }
    }
});


app.get('/admin-add',(req,rep)=>{
    if(!req.session.user){
        rep.redirect('/');
    }else{
        rep.status(200).render('admin/adminAdd')
    }
})

app.get('/admin-delete',(req,rep)=>{
    if(!req.session.user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM user WHERE statut > 0 AND statut <11",[],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        rep.status(200).render('admin/adminDelete',{res})
                    }
                })
            }
        })
    }
})


app.get('/admin-user',(req,rep)=>{
    if(!req.session.user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM user WHERE statut > 0 AND statut <11",[],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        rep.status(200).render('admin/adminUser',{res})
                    }
                })
            }
        })
    }
})

app.get('/dashboard',async (req, rep) => {

    const user = req.session.user

    if(!user){
        rep.redirect('/');
    }else{
        try {
            const con = await new Promise((resolve, reject) => {
                req.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(connection);
                    }
                });
            });

            const valider = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE etat = 'valider' AND id_sub = ?", [user.id], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            const nonValider = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND id_sub = ?", [user.id], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            rep.status(200).render('userDashboard', { valider, nonValider});
        } catch (err) {
            console.log(err);
            rep.status(500).send('Une erreur s\'est produite');
        }
    }
})


app.get('/demande',(req,rep)=>{
    if(!req.session.user){
        rep.redirect('/');
    }else{
        rep.status(200).render('userDemande')
    }
})

// Enregistrement de la demande de l'uilisateur
app.post('/register-user-demande',(req,rep)=>{
    const titre = req.body.titre
    const description = req.body.description
    const justificatif = req.body.justificatif
    const statut = req.body.statut
    const envoyeur = req.session.user.id
    const destinataire = '1'

    req.getConnection((err,con)=>{
        if(err){
            console.log(err)
        }else{
            con.query("INSERT INTO requete(titre, description, raison, statut, id_sub, destinataire, etat) VALUES (?,?,?,?,?,?,'non valider')",[titre,description,justificatif,statut,envoyeur,destinataire],(err,res)=>{
                if(err){
                    console.log(err)
                }else{
                    rep.status(300).redirect('/demande')
                }
            })
        }
    })
})


// Demande en cours
app.get('/demande-etape',(req,rep)=>{

    const user = req.session.user

    let requetes // Unse varible pour receptionner les reponses

    if(!user){
        rep.redirect('/');
    }else{

        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND id_sub = ? ",[user.id],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('userDemandeEtape',{requetes})
                    }
                })
            }
        })
        
    }  
})

// Demande rejeter
app.get('/demande-rejet',(req,rep)=>{
   // Pas encore implementer !! 
   // Non creation de la table
    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM close WHERE userID = ? ",[user.id],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('userDemandeRejet',{requetes})
                    }
                })
            }
        })
    }

})

// Demande approuver
app.get('/demande-approuve',(req,rep)=>{

    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{

        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'valider' AND id_sub = ?  ",[user.id],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('userDemandeApprouver',{requetes})
                    }
                })
            }
        })
    }
})

app.get('/backOffice',async (req, rep) => {

    let user = req.session.user

    if(!user){
        rep.redirect('/');
    }else{
        try {
            const con = await new Promise((resolve, reject) => {
                req.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(connection);
                    }
                });
            });

            const faible = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE statut = 'faible' AND destinataire = ?  ", [user.statut], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            const normal = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE statut = 'normal' AND destinataire = ? ", [user.statut], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            const important = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE statut = 'important' AND destinataire = ? ", [user.statut], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            const urgent = await new Promise((resolve, reject) => {
                con.query("SELECT * FROM requete WHERE statut = 'urgent' AND destinataire = ?", [user.statut], (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.length);
                    }
                });
            });

            rep.status(200).render('backOffice/backOffice', { faible, normal, important, urgent});
        } catch (err) {
            console.log(err);
            rep.status(500).send('Une erreur s\'est produite');
        }
    }
})

app.get('/backOffice-faible',(req,rep)=>{

    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND statut = 'faible' AND destinataire = ?",[user.statut],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('backOffice/backOfficeFaible',{requetes})
                    }
                })
            }
        })
    }
    
})

app.get('/backOffice-normal',(req,rep)=>{

    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND statut = 'normal' AND destinataire = ?",[user.statut],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('backOffice/backOfficeNormal',{requetes})
                    }
                })
            }
        })
    }
 
})

app.get('/backOffice-important',(req,rep)=>{

    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND statut = 'important' AND destinataire = ?",[user.statut],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('backOffice/backOfficeImportant',{requetes})
                    }
                })
            }
        })
    }

})

app.get('/backOffice-urgent',(req,rep)=>{

    const user = req.session.user

    let requetes

    if(!user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE etat = 'non valider' AND statut = 'urgent' AND destinataire = ?",[user.statut],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('backOffice/backOfficeUrgent',{requetes})
                    }
                })
            }
        })
    }
})

// Details sur le demande
app.get('/views-backOffice-:id',(req,rep)=>{

    const id = req.params.id

    let requetes

    if(!req.session.user){
        rep.redirect('/');
    }else{
        req.getConnection((err,con)=>{
            if(err){
                console.log(err)
            }else{
                con.query("SELECT * FROM requete WHERE id = ?",[id],(err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        requetes = res
                        rep.status(200).render('backOffice/view',{requetes})
                    }
                })
            }
        })
    }
})

// Deconnexion
app.get('/deconnexion',(req,rep)=>{
    req.session.destroy((err) => {
        if (err) {
            // En cas d'erreur lors de la destruction de la session, on peut gérer l'erreur ici
            console.error('Erreur lors de la destruction de la session :', err)
            rep.status(500).send('Erreur lors de la déconnexion')
        }
        // Redirection après la déconnexion réussie
        rep.redirect('/')
    });
})

// Gestion des suppressions et des modifications
app.get('/admin-delete-user-:id',(req,rep)=>{

    const id = req.params.id

    req.getConnection((err,con)=>{
        if(err){
            console.log(err)
        }else{
            con.query("DELETE FROM user WHERE id = ?",[id],(err,res)=>{
                if(err){
                    console.log(err)
                }else{
                    rep.redirect('/admin-delete')
                }
            })
        }
    })

})

app.get('/demande-validation-:id', (req, res) => {
    const id = req.params.id;

    req.getConnection((err, con) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Start transaction
        con.beginTransaction(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            // First query
            con.query("UPDATE requete SET destinataire = destinataire + 1 WHERE id = ? AND destinataire < 5", [id], (err, result) => {
                if (err) {
                    return con.rollback(() => {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    });
                }

                // Check if we need to update the state
                con.query("SELECT destinataire FROM requete WHERE id = ?", [id], (err, rows) => {
                    if (err) {
                        return con.rollback(() => {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        });
                    }

                    if (rows.length === 0) {
                        return con.rollback(() => {
                            console.error('No rows found');
                            res.status(404).send('Not Found');
                        });
                    }

                    if (rows[0].destinataire === 4) {
                        // Second query
                        con.query("UPDATE requete SET etat = 'valider' WHERE id = ?", [id], (err, result) => {
                            if (err) {
                                return con.rollback(() => {
                                    console.error(err);
                                    res.status(500).send('Internal Server Error');
                                });
                            }

                            // Commit transaction
                            con.commit(err => {
                                if (err) {
                                    return con.rollback(() => {
                                        console.error(err);
                                        res.status(500).send('Internal Server Error');
                                    });
                                }

                                res.redirect('/backOffice');
                            });
                        });
                    } else {
                        // Commit transaction if no update to state is needed
                        con.commit(err => {
                            if (err) {
                                return con.rollback(() => {
                                    console.error(err);
                                    res.status(500).send('Internal Server Error');
                                });
                            }

                            res.redirect('/backOffice');
                        });
                    }
                });
            });
        });
    });
});


app.get('/demande-rejeter-:id', (req, res) => {

    const id = req.params.id;

    req.getConnection((err, con) => {
        if (err) {
            console.log(err);
            // Handle the error appropriately, e.g., send an error response
            res.status(500).send('Internal Server Error');
        } else {
            con.query("SELECT * FROM requete WHERE id = ?", [id], (err, result) => {
                if (err) {
                    console.log(err);
                    // Handle the error appropriately, e.g., send an error response
                    res.status(500).send('Internal Server Error');
                } else {
                    // Assuming only one row is returned
                    const request = result[0];

                    // Insert into 'delete' table
                    con.query("INSERT INTO close (titre, description, userID, etat, destinataire, date) VALUES (?, ?, ?, ?, ?, NOW())",
                        [request.titre, request.description, request.id_sub, request.etat, request.destinataire], (err, result) => {
                            if (err) {
                                console.log(err);
                                // Handle the error appropriately, e.g., send an error response
                                res.status(500).send('Internal Server Error');
                            } else {
                                // Delete from 'requete' table after successful insert
                                con.query("DELETE FROM requete WHERE id = ?", [id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        // Handle the error appropriately, e.g., send an error response
                                        res.status(500).send('Internal Server Error');
                                    } else {
                                        // Redirect to '/backOffice' after successful delete
                                        res.redirect('/backOffice');
                                    }
                                });
                            }
                        });
                }
            });
        }
    });
});


//En cas d'usa d'une url erroné, la page d'error 404 sera afficher
app.use((req,rep)=>{
    rep.status(300).redirect('/')
})

// Le port de connexion
app.listen(4000,()=>{
    console.log('Connecté au port 4000')
})
