"use strict";

var Component = require("component-class");
var greenlock = require("greenlock");
var log;

module.exports = class ComponentLetsEncryptCert extends Component {
    constructor(cm) {
        super(cm);

        this.addFeature("get-certs", this.getCerts);
        this.addSetterGetterFeature("letsEncryptServer", "string", "staging");
        this.addSetterGetterFeature("letsEncryptOpts", Object);

        this.addDependency("logger");
        this.addDependency("http");
    }

    async init() {
        try {
            var logger = this.cm.get("logger");
            if (logger === undefined) {
                throw new Error("logger component not found");
            }
            log = logger.create("ComponentLetsEncryptCert");

            var webComponent = this.cm.get("http");

            log.debug("Creating Let's Encrypt session to server:", this.letsEncryptServer);
            let le = await greenlock.create({ server: this.letsEncryptServer });
            log.debug("Adding Let's Encrypt route ...");
            webComponent.addDynamic({
                path: "/",
                method: "GET",
                fn: le.middleware(webComponent.app)
            });

            log.info("Getting certificate from Let's Encrypt ...");
            log.debug("Let's Encrypt options:", this.letsEncryptOpts);
            this.leCerts = await le.register(this.letsEncryptOpts);
            log.info("Done getting Let's Encrypt certificate.");
            log.debug("Certificate: ", this.leCerts.cert);
        } catch (err) {
            throw (err);
        }
    }

    getCerts() {
        return {
            cert: this.leCerts.cert,
            key: this.leCerts.privkey
        };
    }

    getCert() {
        return this.leCerts.cert;
    }

    getKey() {
        return this.leCerts.privkey;
    }
};
