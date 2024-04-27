# AwsCodeBuildViz

## Overview

AwsCodeBuildViz is a tool designed to enhance the visibility and analysis of AWS CodeBuild projects. It offers a comprehensive suite of features aimed at simplifying the monitoring and optimization of build processes. Key features include:

- **Result Collection**: Aggregates AWS CodeBuild results for easy access and analysis. Once results are collected, they are cached to enable efficient differential collection on subsequent runs.
- **Graphical Representation**: Visualizes AWS CodeBuild execution times by phase in graphical format, providing clear insights into the build process.
- **Flexible Viewing Options**: Allows users to switch between monthly and daily views for targeted analysis.
- **Customizable Time Periods**: Enables users to freely select the time period for which they want to view build data, offering tailored insights according to specific needs.

With AwsCodeBuildViz, teams can easily track and optimize their AWS CodeBuild projects, ensuring a smoother and more efficient development cycle.

![overview](https://github.com/yukimura1227/AwsCodeBuildViz/blob/main/docs/AwsCodeBuildViz.gif)

## Architecture

![architecture](https://github.com/yukimura1227/AwsCodeBuildViz/blob/main/docs/architecture.drawio.svg)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Docker** is installed on your system. (Recommended)
- Alternatively, **Deno** can also be used.

This project is designed to be run within a Docker container for ease of setup and compatibility. However, for those who prefer, running directly with Deno is also supported.

## Setting up for AWS CodeBuild Access

To access AWS CodeBuild, you need to set up your environment configuration files. Follow these steps:

1. **Create a configuration file**: Copy the `environment.json` file and rename it to `environment.local.json`. We recommend using `environment.local.json` for your local environment as it is not tracked by git, ensuring your settings remain private.

    ```bash
    cp environment.json environment.local.json
    ```

2. **Edit the `environment.local.json` file** with your specific AWS CodeBuild settings. This file will override the default settings provided in `environment.json` for your local environment.

Using `environment.local.json` ensures that your custom configurations are kept out of version control, maintaining the security of your AWS access credentials.

### CASE: using AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

Here is a specific example of how to configure your `environment.json` or `environment.local.json` for accessing AWS CodeBuild using AWS ACCESS KEY. This configuration includes the necessary credentials and project settings:

```json
{
  "codebuildSettings": [
    {
      "credentials": {
        "accessToken": {
          "AWS_ACCESS_KEY_ID": "your aws access key id",
          "AWS_SECRET_ACCESS_KEY": "your secret access key",
          "AWS_SESSION_TOKEN": "your session token" // Optional, only needed for temporary credentials
        }
      },
      "region": "ap-northeast-1",
      "codeBuildProjectName": "your-codebuild-project"
    }
  ]
}
```

Replace "your-aws-profile-name" with the name of your AWS CLI profile that is configured for SSO. Also, adjust "your-codebuild-project" to match the name of your AWS CodeBuild project and ensure the "region" is set to the AWS region where your CodeBuild project is located.

This configuration leverages AWS SSO for a seamless and secure authentication process, avoiding the need to manage access keys directly. Ensure your AWS CLI is properly configured for SSO and that the profile name matches the one specified in your environment file.

### Aggregate AWS CodeBuild Results

### CASE: using AWS SSO

For those who prefer to use AWS SSO for authentication, configure your `environment.json` or `environment.local.json` with the following structure to access AWS CodeBuild:

```json
{
  "codebuildSettings": [
    {
      "credentials": {
        "sso": {
          "awsProfileName": "your-aws-profile-name"
        }
      },
      "region": "ap-northeast-1",
      "codeBuildProjectName": "your-codebuild-project"
    }
  ]
}
```

## Aggregating AWS CodeBuild Results

Upon execution, this project efficiently aggregates AWS CodeBuild results, utilizing Deno.KV for caching. After the initial run, subsequent executions will fetch and aggregate only the differences, thanks to the cached data. This ensures faster processing by retrieving only new or changed build results.
Executing the command below runs then aggregates the AWS CodeBuild results and saves them in the `codeBuildResult/` directory.

Depending on your setup, you can aggregate the results of AWS CodeBuild using either Docker or Deno. Here's how:

### Using Docker

If you're using Docker, run the following command to aggregate the results:

```bash
# using AWS_ACCESS_KEY_ID
docker compose run --rm cli
```

```bash
# using AWS SSO
AWS_PROFILE=your-profile-name aws sso login
docker compose -f compose.yaml -f compose.sso.yaml run --rm cli
```

### Using Deno Directly

For those who prefer or need to use Deno directly, run the following command:

```bash
cd cli/
deno run --unstable-kv --allow-sys --allow-env --allow-read --allow-net --allow-write main.ts
```

## Viewing Aggregated Results

After aggregating the AWS CodeBuild results, you can view them by following these steps:

### Using Docker

If you used Docker to aggregate the results, run the following command to start the visualization tool.
Run the following command to start the visualization tool and access the aggregated results at http://localhost:5173

```bash
docker compose up viz
```

### Using Deno Directly

```bash
cd web/
deno task dev
```
