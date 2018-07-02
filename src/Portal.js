import PouchDB from 'pouchdb';

class Portal {
    constructor ( dbname ) {
        this.dbname = dbname;
        this.db = new PouchDB(this.dbname);
        this.cache = {
        };
        this.rep = this.db.replicate.to(
                'http://localhost:5984/'+this.dbname,
            {
                live: true,
                retry: true,
            });
        this.rep = this.db.replicate.from(
            'http://localhost:5984/'+this.dbname,
            {
                live: true,
                retry: true,
                
            }).on('change', info => {
                console.log("CHANGE",info);
                info.docs.forEach( doc => {
                    this.changedDoc(doc);
                });
                // handle change
            }).on('paused', err => {
                // replication paused (e.g. replication up to date, user went offline)
                console.log("PAUSED",err);
            }).on('active', () => {
                // replicate resumed (e.g. new changes replicating, user went back online)
                console.log("ACTIVE");
            }).on('denied', err => {
                // a document failed to replicate (e.g. due to permissions)
                console.log("DENIED",err);
            }).on('complete', info => {
                // handle complete
                console.log("COMPLETE");
            }).on('error', err => {
                // handle error
                console.log("ERROR",err);
            });
    }
    changedDoc(uf) {
        let ce = this.cache[uf._id];
        if(ce) {
            ce[1] = uf; //todo: make immutable
            ce[0].forEach(func => {
                func(uf);
            });
        }
    }
    notify(uu, func) {
        let ce = this.cache[uu];
        if(! ce) {
            ce = this.cache[uu] = [[func], null ];
            this.get(uu).then( uf => {
                this.changedDoc(uf);
            });
        } else {
            ce[0].push(func);
            func(ce[1]);
        }
        return true;
    }
    deNotify(uu, func) {
        
    }
    get(uu) {
        console.log("PORTAL GET",uu,this.db);
        return this.db.get(uu);
    }
    newUForm(eform) {
        return this.db.post(eform);
    }
    put(uu, dict) {
        
    }
}
export default Portal;


