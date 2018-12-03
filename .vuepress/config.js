module.exports = {
  title: '数据接口开放平台',
  description:
    '整合SQLServer、MySql、ORACLE三大关系型数据库，抹平数据后端差异。',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    repo: 'realeve/api_manager',
    repoLabel: '查看源码',
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '上次更新',
    docsRepo: 'realeve/doc_api_manager',
    // docsDir: '/',
    // docsBranch: 'master',
    editLinks: true,
    nav: [
      {
        text: '手册',
        link: '/guide/'
      },
      {
        text: '进阶',
        link: '/advance/'
      },
      {
        text: '进入系统',
        link: 'http://localhost:90/public/'
      }
    ],
    search: false,
    searchMaxSuggestions: 10,
    sidebar: {
      '/guide/': [
        {
          title: '操作手册',
          collapsable: false,
          children: ['', 'main', 'new']
        }
      ]
    }
  }
};
