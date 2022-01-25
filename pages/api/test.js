const SnappyJS = require("snappyjs");
const fetch = require("node-fetch");
const protobuf = require("protobufjs");

const logger = console;
export const atob = (s) => Buffer.from(s, "base64").toString("binary");
export const btoa = (s) => Buffer.from(s, "binary").toString("base64");

const instanceId = process.env.GRAFANA_INSTANCE_ID;
const apiKey = process.env.GRAFANA_API_KEY;
const pushUrl = "https://prometheus-us-central1.grafana.net/api/prom/push";

const kv = (o) =>
  Object.entries(o).map((e) => ({
    name: e[0],
    value: e[1],
  }));

export default async function handler(req, res) {
    const start1 = Date.now()
    const root = await protobuf.load(process.cwd() + "/prom.proto");
  var WriteRequest = root.lookupType("prometheus.WriteRequest");
  var payload = {
    timeseries: [
      {
        labels: kv({
          __name__: "test_exemplar_metric_total",
          instance: "localhost:8090",
          job: "prometheus",
          service: "bar",
        }),
        samples: [{
            value: Math.random() * 10,
            timestamp: Date.now()
        }]
      },
      {
        labels: kv({
          __name__: "test_exemplar_metric_total",
          instance: "localhost:8090",
          job: "prometheus",
          service: "bar",
        }),
        samples: [{
            value: Math.random() * 10,
            timestamp: Date.now()
        }]
      },
      {
        labels: kv({
          __name__: "test_exemplar_metric_total",
          instance: "localhost:8090",
          job: "prometheus",
          service: "bar",
        }),
        samples: [{
            value: Math.random() * 10,
            timestamp: Date.now()
        }]
      }
    ],
    
  };
  var buffer = WriteRequest.encode(payload).finish();
  var errMsg = WriteRequest.verify(payload);
  if (errMsg) {
    throw new Error(errMsg);
  }
  const start2 = Date.now()
  logger.info("Created in", start2 - start1, "ms")

  await fetch(pushUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: "Basic " + btoa(instanceId + ":" + apiKey),
    },
    body: SnappyJS.compress(buffer),
  }).then(async (r) => {
    const text = await r.text();
    logger.info("pushed metrics", r.status + " " + r.statusText + " " + text, "in", Date.now() - start2, "ms");
  });

  //gateway.pushAdd({ jobName: "test" });

  res.status(200).json({ name: "John Doe" });
}
