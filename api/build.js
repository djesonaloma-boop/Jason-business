// api/build.js - Met ce fichier dans /api/build.js sur ton Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  
  const { appName, appUrl, packageName, color } = req.body;
  
  // On déclenche GitHub Actions qui va builder le vrai APK
  const githubResponse = await fetch(`https://api.github.com/repos/TON_GITHUB_USERNAME/jason-apk-builder/actions/workflows/build.yml/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        app_name: appName,
        app_url: appUrl,
        package_name: packageName,
        theme_color: color
      }
    })
  });

  if (githubResponse.ok) {
    return res.json({ 
      success: true, 
      message: 'Build APK lancé! Dans 2 min ton APK sera prêt!',
      checkUrl: `https://github.com/TON_GITHUB_USERNAME/jason-apk-builder/actions`
    });
  } else {
    return res.status(500).json({error: 'Erreur GitHub'});
  }
}
