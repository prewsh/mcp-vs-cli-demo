# Local deployment CLI

The installed CLI is `democtl`. It outputs JSON by default. Use returned IDs.

List projects:

    democtl projects list

Start a deployment:

    democtl projects deploy --project-id PROJECT_ID

Check the resulting deployment:

    democtl deployments status --deployment-id DEPLOYMENT_ID

Read a bounded runtime log snapshot:

    democtl deployments logs --deployment-id DEPLOYMENT_ID --tail 100

A deployment initially marked `starting` needs another status check. Assess the
returned status before reporting success. Use `democtl --help` for syntax details.
