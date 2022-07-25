const fastify = require("fastify")({ logger: true });
const fastifyEnv = require("@fastify/env");
const es = require("@fastify/elasticsearch");
// Declare a route

const schema = {
    type: "object",
    required: ["PORT", "ELASTIC_SEARCH_URI"],
    properties: {
        PORT: {
            type: "string",
            default: 4000,
        },
        ELASTIC_SEARCH_URI: {
            type: "string",
        },
    },
};

fastify.get("/", async (request, reply) => {
    return { hello: "world" };
});

fastify.get("/companies", async function (request, reply) {
    console.log(request.query);
    const { query } = request.query;
    const res = await this.elastic.search({
        index: "company_name",
        body: {
            query: {
                wildcard: {
                    company_name: `*${query || ""}*`,
                },
            },
            _source: ["company_name"],
        },
    });
    console.log(process.env.ELASTIC_SEARCH_URI);

    return res.hits.hits;
});
const initialize = async () => {
    const options = {
        dotenv: true,
        confKey: "config",
        schema: schema,
    };
    fastify.register(fastifyEnv, options);
    await fastify.after();
    fastify.register(es, { node: fastify.config.ELASTIC_SEARCH_URI });
};
initialize();
// Run the server!
const start = async () => {
    try {
        await fastify.ready();
        await fastify.listen({ port: fastify.config.PORT || 4000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
