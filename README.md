# 🌊 flux

## Local development

Clone the repo:
```
git clone git@github.com:livewire/flux.git
```

Set up the environment:
```
composer install
npm install
```

Bundle the JS & CSS:
```
npm run build
```

### Test it in a local Laravel project

From the root of the project, run:
```
composer config repositories.local '{"type": "path", "url": "./../flux"}' --file composer.json
```

> Note: The path to the local Flux repo is relative to the root of the project.

Now, you can run:

```
composer require livewire/flux:dev-main --dev
```

> Note: You might have to change your app's "minimum-stability" to "dev" in your `composer.json` file.

### Testing components with playwright

Use valet or herd to link and open the project in a browser. URL should be http://flux-pro.test/. If you are using valet you can run the following commands.
```
valet link && valet open
```

Test webpages are located in the tests directory as html files. Example link: http://flux-pro.test/tests/select.html

Open playwright tool to run your tests:
```
npm run test
```

Install the required playwright browser resources to run tests:
```
npx playwright install
```
