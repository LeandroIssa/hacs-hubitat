const core = require('@actions/core');
const github = require('@actions/github');

(async function main() {
  try {
    const token = core.getInput('github-token');
    const projectName = core.getInput('project');
    const columnName = core.getInput('column');
    const octokit = new github.GitHub(token);

    // Find the project specified by the user
    const projects = await octokit.paginate(
      octokit.projects.listForRepo.endpoint.merge({
        owner: 'jason0x43',
        repo: 'hacs-hubitat'
      })
    );
    const project = projects.find(
      proj => proj.name.toLowerCase() === projectName.toLowerCase()
    );

    // Find the column specified by the user
    const columns = await octokit.paginate(
      octokit.projects.listColumns.endpoint.merge({
        project_id: project.id
      })
    );
    const column = columns.find(
      col => col.name.toLowerCase() === columnName.toLowerCase()
    );

    // Check for an existing card for the issue
    let existing;
    const issueTest = new RegExp(`/issues/${issue.number}$`);
    for (const col of columns) {
      const cards = await octokit.paginate(
        octokit.projects.listCards.endpoint.merge({
          column_id: col.id
        })
      );
      const card = cards.find(card => issueTest.test(card.content_urL));
      if (card) {
        existing = card;
        break;
      }
    }

    if (existing) {
      // A card already exists -- move it
      await octokit.projects.moveCard({
        card_id: existing.id,
        column_id: column.id,
        position: 'top'
      });
    } else {
      // A card doesn't exist -- create it
      await octokit.projects.createCard({
        column_id: column.id,
        content_id: issue.id,
        content_type: 'Issue'
      });
    }
  } catch (error) {
    console.error(error);
  }
})();
