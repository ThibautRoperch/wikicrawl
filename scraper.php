
<?php

header('Content-Type: application/json');

$url = NULL;

if (isset($_GET["url"])) {
  $url = $_GET["url"];
} else {
  // Page Wikipédia aléatoire

  // $random_url = "https://fr.wikipedia.org/wiki/Langue";
  // $random_url = "https://fr.wikipedia.org/wiki/Le_Coon"; // Paragraphe vide sans classe au début
  // $random_url = "https://fr.wikipedia.org/wiki/An%C3%A9mie_aplasique"; // Pas de liens dans le premier paragraphe, uniquement dans des listes
  $random_url = "https://fr.wikipedia.org/wiki/Sp%C3%A9cial:Page_au_hasard";

  $url = $random_url;
}

$page = file_get_contents($url);

// Récupération de la page sous le format DOM Document

$doc = new DOMDocument(); 
@$doc->loadHTML($page);

include("dom_handler.php");

// Infos sur la page

preg_match('/rel=\"canonical\" href=\"(https:\/\/fr\.wikipedia\.org\/wiki\/.+)\"/', $page, $url_node);
$url = $url_node[1];

$title = $doc->getElementById("firstHeading")->nodeValue;

// Recherche des noeuds contenant du texte dans le noeud principal
// Recherche des liens dans ces noeuds

$main_content = $doc->getElementById("mw-content-text")->childNodes[0];

$contents = dom_search_multiple_nodes($main_content, ["p", "ul", "ol"]);

$links = [];

$i = 0;
while (/*count($links) === 0 && */$i < count($contents)) { // Si count($links) === 0 décommenté, la recherche will stop au premier content qui a au moins un lien  
  $content = $contents[$i];
  $content_links = dom_search_nodes($content, "a", true);

  foreach ($content_links as $link) {
    $href = dom_search_attribute($link, "href");
    if (preg_match('/^\/wiki/', $href)) {
      array_push($links, $href);
    }
  }

  ++$i;
}

// Formattage des liens

$formatted_links = array_map(
  function ($link) {
    return "https://fr.wikipedia.org$link";
  },
  $links
);

// Retour du résultat

// echo "$title - <a href=\"$url\">$url</a>";
// var_dump($links);

$res = [
  "success" => true,
  "title" => $title,
  "url" => $url,
  "links" => $formatted_links
];

echo(json_encode($res));

?>
