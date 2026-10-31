# Saved MCP tool inventory

This table is the subject-generated baseline inventory from 31 October 2026. Its 144 descriptions were **condensed from tool metadata**, rather than captured as the complete live tools/list schema. No tools were called to create the inventory.

| Tool name | Description |
|---|---|
| `add_addon_domain` | Add a custom domain to an add-on deployment, targeting a network UUID or port. |
| `add_billing_card` | Add a billing card using a payment provider token. |
| `attach_project_group_member` | Attach a project or add-on deployment to a project group. |
| `cancel_subscription` | Cancel a billing subscription. |
| `check_repository_dockerfile` | Check whether a repository branch contains a Dockerfile. |
| `connect_project_group_services` | Wire a provider’s connection environment variables into a consumer project within a group. |
| `create_ai_review_fix_pr` | Apply AI review findings and open or continue a GitHub fix PR as PipeOps[bot]. Reuses existing jobs or completed fixes and waits for completion by default. |
| `create_environment` | Create an environment on a server or cluster, requiring a name, workspace, and cluster UUID. |
| `create_external_registry` | Create an external container registry configuration. |
| `create_gitops_application` | Create a GitOps application configuration within a workspace. |
| `create_project` | Create a project and queue deployment, using supplied build, source, network, and environment settings. |
| `create_project_group` | Create an empty project group. |
| `create_sandbox` | Create a sandbox through the PipeOps BFF and Rexec; omitted name and image use server defaults. |
| `create_sandbox_session` | Create a short-lived terminal or session grant for a sandbox. |
| `create_service_account_token` | Create a service account token bound to a workspace. |
| `create_team` | Create a team. |
| `create_workspace` | Create a workspace with a name containing 5–25 letters; unpaid Nova usage can block creation. |
| `create_workspace_checkout` | Create workspace billing or checkout configuration. |
| `delete_billing_card` | Delete a billing card. |
| `delete_environment` | Delete an environment. |
| `delete_external_registry` | Delete an external registry configuration. |
| `delete_gitops_application` | Delete a GitOps application configuration within a workspace. |
| `delete_project` | Delete a project. |
| `delete_project_group` | Delete a project group. |
| `delete_sandbox` | Permanently delete a sandbox. |
| `delete_volume` | Permanently delete a workspace volume. |
| `delete_workspace` | Delete a workspace. |
| `deploy_addon` | Deploy a marketplace add-on, filling omitted configuration and environment settings from defaults. |
| `deploy_project` | Deploy an existing project using stored settings; optionally force a clean rebuild. |
| `deploy_project_from_image` | Create and deploy a project from a prebuilt container image. |
| `detach_project_group_member` | Detach a member from a project group. |
| `exec_in_sandbox` | Run a noninteractive shell command in a running sandbox and return output and exit code. |
| `export_volume` | Start an asynchronous export of a workspace volume. |
| `get_active_card` | Get the active billing card for the current workspace. |
| `get_addon` | Get detailed information about an add-on. |
| `get_addon_backup_export` | Get the status of an add-on backup export job. |
| `get_addon_deployment` | Get detailed information about an add-on deployment from the workspace deployments overview. |
| `get_addon_deployment_session` | Get an add-on deployment session; requires workspace scope. |
| `get_ai_review` | Get an AI code review, including summary, findings, available actions, and retained redacted diff. |
| `get_ai_review_fix_job` | Get an AI review fix-PR job’s status, progress, strategy, and resulting PR and files. |
| `get_balance` | Get the current account balance. |
| `get_billing_info` | Get account billing balance and subscription information. |
| `get_billing_portal_url` | Get the billing portal URL. |
| `get_current_user` | Get the current user profile. |
| `get_environment` | Get detailed information about an environment. |
| `get_external_registry` | Get detailed information about an external registry. |
| `get_gitops_application` | Get a GitOps application configuration by UUID within a workspace. |
| `get_gitops_diff` | Get the difference between Git and live state for a GitOps application. |
| `get_gitops_history` | Get paginated sync history for a GitOps application. |
| `get_gitops_sync_status` | Get a GitOps application’s current sync and health status. |
| `get_my_addon_submissions` | List the current user’s add-on submissions. |
| `get_project` | Get detailed information about a project. |
| `get_project_build_logs` | Get deployment build logs from the dashboard’s build-log source; defaults to the latest deployment. |
| `get_project_env_variables` | Get a project’s environment variables, optionally scoped to a workspace. |
| `get_project_group` | Get a project group by UUID. |
| `get_project_group_shared_env` | Get a project group’s shared environment variables. |
| `get_project_group_topology` | Get a project group’s topology plane. |
| `get_project_logs` | Get project logs. |
| `get_sandbox` | Get a sandbox by ID. |
| `get_sandbox_usage` | Get daily sandbox usage rollups for a workspace and date range. |
| `get_server` | Get server or cluster details by UUID, exact name, slug, or numeric ID. |
| `get_server_connection` | Get server connection information using its UUID. |
| `get_server_cost_allocation` | Get a server’s compute cost allocation. |
| `get_service_account_token` | Get detailed information about a service account token within a workspace. |
| `get_subscription` | Get detailed information about a subscription. |
| `get_team` | Get detailed information about a team. |
| `get_volume` | Get detailed information about a workspace volume. |
| `get_volume_export` | Get the status of a workspace volume export job. |
| `get_workspace` | Get detailed information about a workspace. |
| `inject_project_group_shared_env` | Inject stored project-group shared environment variables into member services. |
| `invite_team_member` | Invite a member to a team. |
| `link_vcs_provider` | Initiate VCS provider linking and return its authorization URL. |
| `list_addon_backups` | List backup snapshots for an add-on deployment. |
| `list_addon_categories` | List add-on categories. |
| `list_addon_deployments` | List add-on deployments. |
| `list_addons` | List available add-ons with optional search and filters. |
| `list_ai_reviews` | List a project’s recent AI code reviews, newest first, with status, PR number, finding count, and review UUID. |
| `list_billing_plans` | List billing plans priced by location; defaults to the US. |
| `list_cloud_provider_instance_categories` | List a cloud provider’s instance categories. |
| `list_cloud_provider_instance_types` | List instance types for a cloud provider and class. |
| `list_cloud_provider_regions` | List available regions for a cloud provider. |
| `list_cloud_provider_server_templates` | List recommended server templates for a cloud provider. |
| `list_environments` | List environments, excluding those on deleted or unavailable servers unless requested. |
| `list_external_registries` | List a workspace’s external registries; defaults to the first available workspace. |
| `list_external_registry_images` | List Docker Hub repositories available through an external registry. |
| `list_external_registry_tags` | List image tags for a repository in an external registry. |
| `list_gitops_applications` | List GitOps application configurations for a specified workspace. |
| `list_invoices` | List billing invoices. |
| `list_project_audit_logs` | List historical project actions, including deployments, environment changes, and pauses. |
| `list_project_deployment_history` | List deployment history records for a project. |
| `list_project_deployments` | List build or Git deployments for a project. |
| `list_project_group_candidates` | List projects and add-ons eligible for attachment to a project group. |
| `list_project_groups` | List project groups for a workspace. |
| `list_projects` | List all projects in PipeOps. |
| `list_public_registry_tags` | List tags for a public Docker Hub image. |
| `list_sandbox_files` | List files and directories in a running sandbox; defaults to `/home/user`. |
| `list_sandboxes` | List a workspace’s Rexec sandboxes through the PipeOps BFF. |
| `list_servers` | List all servers and clusters, including UUIDs and workspace IDs. |
| `list_service_account_tokens` | List service account tokens. |
| `list_subscriptions` | List billing subscriptions. |
| `list_team_members` | List team members and their user UUIDs for membership operations. |
| `list_teams` | List all teams. |
| `list_vcs_branches` | List repository branches in a VCS provider. |
| `list_vcs_organizations` | List linked VCS organizations or personal profiles for a provider. |
| `list_vcs_repositories` | List repositories for a VCS organization or personal profile. |
| `list_volumes` | List workspace volumes with optional status and cluster filters. |
| `list_workspace_audit_logs` | List historical actions across workspace projects, optionally filtered to one project. |
| `list_workspace_cards` | List billing cards for the current workspace. |
| `list_workspaces` | List all workspaces. |
| `put_project_group_shared_env` | Replace a project group’s shared environment variables. |
| `read_sandbox_file` | Read a running sandbox’s file as UTF-8 or base64, capped at approximately 2 MiB. |
| `redeploy_project_group_apps` | Queue redeployments for application members of a project group. |
| `remount_volume` | Remount an unattached volume onto a project or add-on. |
| `remove_team_member` | Remove a team member using their user UUID. |
| `resolve_project_group_member` | Determine which project group a service member belongs to. |
| `restart_addon_deployment` | Restart an add-on by rolling its pods; fails while the add-on is deploying. |
| `restart_project` | Restart a project by triggering a redeployment. |
| `restart_sandbox` | Restart a sandbox by stopping and starting it. |
| `revoke_service_account_token` | Revoke a service account token within a workspace. |
| `search_addons` | Search marketplace add-ons using a required text query. |
| `search_project_deployments` | Search project deployments by SHA, status, commit message, URL, or related values. |
| `search_public_registry_images` | Search public Docker Hub images without configuring a registry. |
| `search_vcs_repositories` | Search repositories within a VCS organization or personal profile. |
| `set_environment_variables` | Set an environment’s variables. |
| `set_workspace_billing_email` | Set a workspace’s billing email. |
| `start_addon_backup_export` | Start an asynchronous export of an add-on backup snapshot. |
| `start_sandbox` | Start a stopped sandbox. |
| `start_trial` | Start a billing trial for a plan. |
| `stop_project` | Stop a project by scaling its replicas to zero. |
| `stop_sandbox` | Stop a running sandbox. |
| `subscribe_to_plan` | Subscribe the current account to a billing plan. |
| `sync_gitops_application` | Trigger a manual sync for a GitOps application within a workspace. |
| `update_environment` | Update an environment’s name; currently returns an unsupported error because the API endpoint is disabled. |
| `update_gitops_application` | Update a GitOps application configuration within a workspace. |
| `update_project` | Update a project’s name or port through settings endpoints; description updates are unsupported. |
| `update_project_deploy_settings` | Update deployment and source-control settings, preserving omitted values and triggering a settings deployment. |
| `update_project_env_variables` | Update project environment variables; merges by default or replaces all when requested. |
| `update_project_group` | Update project group metadata. |
| `update_project_security_policy` | Partially update image-scan security policy, preserving omitted thresholds and applying explicit zeros. |
| `update_service_account_token` | Update a service account token within a workspace. |
| `update_team` | Update a team. |
| `update_team_member_role` | Update a team member’s role using their user UUID. |
| `update_workspace` | Update a workspace. |
| `view_addon_deployment_configs` | View an add-on deployment’s configuration; requires workspace scope. |
