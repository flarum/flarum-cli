<x-mail::plain.information>
<x-slot:body>
<% if (!content) { %><!-- Required content -->
<% } else { %><%- content %><% } %>
</x-slot:body>
</x-mail::plain.information>

